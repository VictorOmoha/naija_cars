const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const createBookingValidation = [
  body('listingId').notEmpty().withMessage('Listing id is required'),
  body('bookingType').isIn(['purchase', 'rental']).withMessage('Invalid booking type'),
  body('rentalDays').optional({ nullable: true }).isInt({ min: 1, max: 365 }),
  body('paymentMethod').trim().notEmpty().withMessage('Payment method is required'),
  body('totalAmount').isFloat({ gt: 0 }).withMessage('Total amount must be greater than zero'),
  body('addons').optional().isObject(),
  body('contactInfo').optional().isObject(),
  body('listingSnapshot').optional().isObject(),
  body('promoCode').optional({ nullable: true }).trim(),
];

const createReference = () => {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `NC-${Date.now().toString(36).toUpperCase()}-${suffix}`;
};

const roundMoney = (amount) => Math.max(0, Math.round(Number(amount || 0) * 100) / 100);

const calculateServerTotal = ({ bookingType, listing, snapshot, rentalDays, addons = {}, promoCode }) => {
  const days = bookingType === 'rental' ? parseInt(rentalDays || 1, 10) : 1;
  const listingPrice = Number(listing?.price ?? snapshot?.pricePerDay ?? snapshot?.price ?? 0);
  const basePrice = bookingType === 'rental' ? listingPrice * days : listingPrice;
  const insuranceFee = addons.insurance ? (bookingType === 'rental' ? 15000 * days : 500000) : 0;
  const deliveryFee = addons.delivery ? 50000 : 0;
  const inspectionFee = addons.inspection ? 75000 : 0;
  const serviceFee = bookingType === 'rental' ? 5000 : basePrice * 0.01;
  const promoDiscount = promoCode ? (bookingType === 'rental' ? 20000 : basePrice * 0.05) : 0;

  return roundMoney(basePrice + insuranceFee + deliveryFee + inspectionFee + serviceFee - promoDiscount);
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
      listingSnapshot = null,
      totalAmount,
      promoCode,
    } = req.body;

    const listing = await prisma.carListing.findFirst({
      where: { id: String(listingId), status: 'ACTIVE' },
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

    if (!listing && !listingSnapshot) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found or no longer available' },
      });
    }

    const snapshot = listing
      ? {
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
        }
      : listingSnapshot;

    const serverTotal = calculateServerTotal({ bookingType, listing, snapshot, rentalDays, addons, promoCode });
    const clientTotal = roundMoney(totalAmount);

    if (!serverTotal || Math.abs(clientTotal - serverTotal) > 1) {
      return res.status(400).json({
        success: false,
        error: { message: 'Booking total could not be verified. Please refresh and try again.' },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        reference: createReference(),
        buyerId: req.user.id,
        sellerId: listing?.sellerId || listingSnapshot?.sellerId || null,
        listingId: String(listingId),
        bookingType: bookingType === 'rental' ? 'RENTAL' : 'PURCHASE',
        rentalDays: bookingType === 'rental' ? parseInt(rentalDays || 1, 10) : null,
        paymentMethod,
        addons,
        contactInfo,
        listingSnapshot: snapshot,
        totalAmount: serverTotal,
        promoCode: promoCode || null,
      },
    });

    res.status(201).json({
      success: true,
      message: bookingType === 'rental' ? 'Booking confirmed' : 'Order placed successfully',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
