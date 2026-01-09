const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/',
  authenticate,
  [
    body('listingId').notEmpty().withMessage('Listing ID is required'),
    body('bookingType').isIn(['PURCHASE', 'RENTAL', 'TEST_DRIVE']).withMessage('Invalid booking type'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Base price is required'),
    body('totalPrice').isFloat({ min: 0 }).withMessage('Total price is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', details: errors.array() }
        });
      }

      const {
        listingId,
        bookingType,
        firstName,
        lastName,
        email,
        phone,
        basePrice,
        totalPrice,
        serviceFee = 0,
        insuranceFee = 0,
        deliveryFee = 0,
        promoDiscount = 0,
        startDate,
        endDate,
        rentalDays,
        paymentMethod,
        deliveryAddress,
        pickupLocation,
        hasInsurance = false,
        hasDelivery = false,
        hasInspection = false,
        notes
      } = req.body;

      // Verify listing exists and is active
      const listing = await prisma.carListing.findUnique({
        where: { id: listingId }
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: { message: 'Listing not found' }
        });
      }

      if (listing.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          error: { message: 'This listing is not available for booking' }
        });
      }

      // Create the booking
      const booking = await prisma.booking.create({
        data: {
          userId: req.user.id,
          listingId,
          bookingType,
          firstName,
          lastName,
          email,
          phone,
          basePrice,
          totalPrice,
          serviceFee,
          insuranceFee,
          deliveryFee,
          promoDiscount,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          rentalDays,
          paymentMethod,
          deliveryAddress,
          pickupLocation,
          hasInsurance,
          hasDelivery,
          hasInspection,
          notes,
          status: 'PENDING',
          paymentStatus: 'PENDING'
        },
        include: {
          listing: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              price: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: { booking }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      ...(status && { status: status.toUpperCase() }),
      ...(type && { bookingType: type.toUpperCase() })
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          listing: {
            include: {
              media: {
                orderBy: { displayOrder: 'asc' },
                take: 1
              },
              seller: {
                include: {
                  profile: {
                    select: {
                      businessName: true,
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get a specific booking
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        listing: {
          include: {
            media: true,
            seller: {
              include: {
                profile: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    // Only allow the booking owner or listing seller to view
    if (booking.userId !== req.user.id && booking.listing.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to view this booking' }
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private
 */
router.put('/:id/status',
  authenticate,
  [
    body('status').isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
      .withMessage('Invalid status')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', details: errors.array() }
        });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: req.params.id },
        include: { listing: true }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: { message: 'Booking not found' }
        });
      }

      // Only allow booking owner to cancel, or listing seller to update
      const isOwner = booking.userId === req.user.id;
      const isSeller = booking.listing.sellerId === req.user.id;

      if (!isOwner && !isSeller) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this booking' }
        });
      }

      // Owners can only cancel
      if (isOwner && !isSeller && req.body.status !== 'CANCELLED') {
        return res.status(403).json({
          success: false,
          error: { message: 'You can only cancel this booking' }
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: req.params.id },
        data: { status: req.body.status }
      });

      res.json({
        success: true,
        data: { booking: updatedBooking }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/bookings/:id/payment
 * @desc    Update payment status (for payment callback)
 * @access  Private
 */
router.put('/:id/payment',
  authenticate,
  [
    body('paymentStatus').isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
      .withMessage('Invalid payment status'),
    body('paymentRef').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', details: errors.array() }
        });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: req.params.id }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: { message: 'Booking not found' }
        });
      }

      if (booking.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized' }
        });
      }

      const updateData = {
        paymentStatus: req.body.paymentStatus,
        ...(req.body.paymentRef && { paymentRef: req.body.paymentRef }),
        ...(req.body.paymentStatus === 'PAID' && {
          paidAt: new Date(),
          status: 'CONFIRMED'
        })
      };

      const updatedBooking = await prisma.booking.update({
        where: { id: req.params.id },
        data: updateData
      });

      res.json({
        success: true,
        data: { booking: updatedBooking }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
