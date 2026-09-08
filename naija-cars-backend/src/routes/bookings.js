const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { calculateBookingTotal } = require('../services/bookingPricing');

const router = express.Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const where = { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }] };
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 20, skip: (page - 1) * 20 }),
      prisma.booking.count({ where }),
    ]);
    res.json({ success: true, data: { bookings, pagination: { page, total, pages: Math.ceil(total / 20) } } });
  } catch (error) { next(error); }
});

const createBookingValidation = [
  body('listingId').isString().bail().notEmpty().withMessage('Listing id is required'),
  body('bookingType').isIn(['purchase', 'rental']).withMessage('Invalid booking type'),
  body('rentalDays').optional({ nullable: true }).isInt({ min: 1, max: 365 }),
  body('paymentMethod').isIn(['paystack', 'flutterwave', 'bank_transfer', 'arrange_with_seller']),
  body('totalAmount').isFloat({ gt: 0 }).withMessage('Total amount must be greater than zero'),
  body('addons').optional().isObject(),
  ...['insurance', 'delivery', 'inspection'].map((key) => body(`addons.${key}`).optional().isBoolean({ strict: true })),
  body('contactInfo').isObject(),
  body('contactInfo.firstName').isString().bail().trim().notEmpty(),
  body('contactInfo.lastName').isString().bail().trim().notEmpty(),
  body('contactInfo.email').isEmail(),
  body('contactInfo.phone').isString().bail().trim().matches(/^\+?[\d\s()-]{7,20}$/),
  body('listingSnapshot').optional().isObject(),
  body('promoCode').optional({ nullable: true }).trim(),
];

const createReference = () => {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `NC-${Date.now().toString(36).toUpperCase()}-${suffix}`;
};

router.post('/', authenticate, createBookingValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const {
      listingId,
      bookingType,
      rentalDays,
      paymentMethod,
      addons = {},
      contactInfo = {},
      totalAmount,
      promoCode,
    } = req.body;

    const listing = await prisma.carListing.findFirst({
      where: { id: listingId, status: 'ACTIVE', seller: { isActive: true } },
      include: {
        media: { orderBy: { displayOrder: 'asc' }, take: 1 },
        seller: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                businessName: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found or no longer available' },
      });
    }

    if (listing.sellerId === req.user.id) {
      return res.status(400).json({ success: false, error: { message: 'You cannot book your own listing' } });
    }
    const calculatedTotal = calculateBookingTotal(listing, { bookingType, rentalDays, addons, promoCode });
    if (Math.round(Number(totalAmount) * 100) !== Math.round(calculatedTotal * 100)) {
      return res.status(409).json({
        success: false,
        error: { message: 'The booking total has changed. Refresh the listing and review your booking.' },
      });
    }

    const snapshot = {
          id: listing.id,
          make: listing.make,
          model: listing.model,
          year: listing.year,
          trim: listing.trim,
          price: listing.price,
          locationCity: listing.locationCity,
          locationState: listing.locationState,
          image: listing.media?.[0]?.url || listing.media?.[0]?.thumbnailUrl || null,
          sellerName:
            listing.seller?.profile?.businessName ||
            `${listing.seller?.profile?.firstName || ''} ${listing.seller?.profile?.lastName || ''}`.trim() ||
            listing.seller?.email ||
            null,
        };

    const booking = await prisma.booking.create({
      data: {
        reference: createReference(),
        buyerId: req.user.id,
        sellerId: listing.sellerId,
        listingId: String(listingId),
        bookingType: bookingType === 'rental' ? 'RENTAL' : 'PURCHASE',
        rentalDays: bookingType === 'rental' ? parseInt(rentalDays || 1, 10) : null,
        paymentMethod,
        addons,
        contactInfo,
        listingSnapshot: snapshot,
        totalAmount: calculatedTotal,
        promoCode: promoCode || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking request received. No payment has been collected.',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
