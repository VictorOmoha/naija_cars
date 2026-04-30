const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticate, requireVerified } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/subscription');

const router = express.Router();

const sellerProfileSelect = {
  id: true,
  userId: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  about: true,
  city: true,
  state: true,
  businessName: true,
  businessLogoUrl: true,
  verificationBadge: true,
  createdAt: true,
  updatedAt: true
};

const publicSellerSelect = {
  id: true,
  email: true,
  phoneNumber: true,
  userType: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: sellerProfileSelect
  }
};

const clampPagination = (pageValue, limitValue, maxLimit = 50) => {
  const page = Math.max(parseInt(pageValue, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(limitValue, 10) || 12, 1), maxLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const parseOptionalBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
};

/**
 * @route   GET /api/listings
 * @desc    Get all listings with filters
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      make,
      model,
      minPrice,
      maxPrice,
      state,
      condition,
      transmission,
      fuelType,
      minYear,
      maxYear,
      featured,
      search
    } = req.query;

    const pagination = clampPagination(page, limit);

    // Build where clause
    const where = {
      status: 'ACTIVE',
      ...(type && { listingType: type.toUpperCase() }),
      ...(make && { make: { contains: make, mode: 'insensitive' } }),
      ...(model && { model: { contains: model, mode: 'insensitive' } }),
      ...(state && { locationState: state }),
      ...(condition && { condition: condition.toUpperCase() }),
      ...(transmission && { transmission }),
      ...(fuelType && { fuelType }),
      ...(featured !== undefined && { isFeatured: parseOptionalBoolean(featured, true) }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) })
        }
      }),
      ...((minYear || maxYear) && {
        year: {
          ...(minYear && { gte: parseInt(minYear, 10) }),
          ...(maxYear && { lte: parseInt(maxYear, 10) })
        }
      }),
      ...(search && {
        OR: [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [listings, total] = await Promise.all([
      prisma.carListing.findMany({
        where,
        include: {
          media: {
            orderBy: { displayOrder: 'asc' },
            take: 1
          },
          seller: {
            select: publicSellerSelect
          }
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [
          { isFeatured: 'desc' },
          { isBoosted: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.carListing.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total,
          page: pagination.page,
          limit: pagination.limit,
          pages: Math.ceil(total / pagination.limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/listings/:id
 * @desc    Get single listing by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await prisma.carListing.findFirst({
      where: {
        id: req.params.id,
        status: 'ACTIVE'
      },
      include: {
        media: {
          orderBy: { displayOrder: 'asc' }
        },
        seller: {
          select: publicSellerSelect
        }
      }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Listing not found'
        }
      });
    }

    // Increment view count
    await prisma.carListing.update({
      where: { id: req.params.id },
      data: { viewsCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: { listing }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/listings
 * @desc    Create new listing
 * @access  Private (Verified users only)
 */
router.post('/',
  authenticate,
  requireVerified,
  requireActiveSubscription,
  [
    body('listingType').isIn(['SALE', 'RENT']),
    body('make').trim().notEmpty(),
    body('model').trim().notEmpty(),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('transmission').trim().notEmpty(),
    body('fuelType').trim().notEmpty(),
    body('condition').isIn(['FOREIGN_USED', 'NIGERIAN_USED', 'BRAND_NEW']),
    body('price').isDecimal({ decimal_digits: '0,2' }),
    body('locationState').trim().notEmpty(),
    body('locationCity').trim().notEmpty(),
    body('description').optional().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }

      const {
        listingType, make, model, year, trim, title, mileage, transmission,
        fuelType, bodyType, color, engineSize, condition, price,
        negotiable, locationState, locationCity, phone, whatsapp,
        vinNumber, description
      } = req.body;

      // Paid subscribers receive automatic featured placement for listings
      // created within their plan allowance.
      const isFeatured = Boolean(req.subscription);

      // Reserve the subscription slot before creating the listing. This keeps
      // concurrent create requests from exceeding the user's plan limit.
      const listing = await prisma.$transaction(async (tx) => {
        const now = new Date();
        const subscriptionWhere = {
          id: req.subscription.id,
          userId: req.user.id,
          isActive: true,
          endDate: { gt: now },
          ...(req.subscription.listingsLimit !== -1 && {
            listingsUsed: { lt: req.subscription.listingsLimit }
          })
        };

        const reservation = await tx.subscription.updateMany({
          where: subscriptionWhere,
          data: { listingsUsed: { increment: 1 } },
        });

        if (reservation.count !== 1) {
          const error = new Error(
            req.subscription.listingsLimit === -1
              ? 'Your subscription is no longer active. Please renew your plan to create listings.'
              : `You have used all ${req.subscription.listingsLimit} listings for this billing period. Upgrade your plan for more listings.`
          );
          error.status = 403;
          throw error;
        }

        const newListing = await tx.carListing.create({
          data: {
            listingType, make, model,
            year: parseInt(year, 10),
            trim, title,
            mileage: mileage ? parseInt(mileage, 10) : null,
            transmission, fuelType,
            bodyType: bodyType || null,
            color: color || null,
            engineSize: engineSize || null,
            condition,
            price: parseFloat(price),
            negotiable: parseOptionalBoolean(negotiable, true),
            locationState, locationCity,
            phone: phone || null,
            whatsapp: whatsapp || null,
            vinNumber, description,
            sellerId: req.user.id,
            status: 'ACTIVE',
            isFeatured,
          },
          include: {
            seller: {
              select: publicSellerSelect
            }
          }
        });

        return newListing;
      });

      res.status(201).json({
        success: true,
        message: 'Your listing is now live!',
        data: { listing }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/listings/:id
 * @desc    Update listing
 * @access  Private (Owner only)
 */
router.put('/:id',
  authenticate,
  [
    body('listingType').optional().isIn(['SALE', 'RENT']),
    body('make').optional().trim().notEmpty(),
    body('model').optional().trim().notEmpty(),
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('transmission').optional().trim().notEmpty(),
    body('fuelType').optional().trim().notEmpty(),
    body('condition').optional().isIn(['FOREIGN_USED', 'NIGERIAN_USED', 'BRAND_NEW']),
    body('price').optional().isFloat({ gt: 0 }),
    body('mileage').optional({ nullable: true }).isInt({ min: 0 }),
    body('locationState').optional().trim().notEmpty(),
    body('locationCity').optional().trim().notEmpty(),
    body('negotiable').optional().isBoolean(),
    body('description').optional().trim(),
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

    // Check if listing exists and user owns it
    const existingListing = await prisma.carListing.findUnique({
      where: { id: req.params.id }
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found' }
      });
    }

    if (existingListing.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to edit this listing' }
      });
    }

    const allowedFields = [
      'listingType', 'make', 'model', 'year', 'trim', 'title', 'mileage',
      'transmission', 'fuelType', 'bodyType', 'color', 'engineSize',
      'condition', 'price', 'negotiable',
      'locationState', 'locationCity', 'phone', 'whatsapp',
      'vinNumber', 'description'
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    if (updateData.year !== undefined) updateData.year = parseInt(updateData.year, 10);
    if (updateData.mileage !== undefined && updateData.mileage !== null) {
      updateData.mileage = parseInt(updateData.mileage, 10);
    }
    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
    if (updateData.negotiable !== undefined) updateData.negotiable = parseOptionalBoolean(updateData.negotiable, true);

    const listing = await prisma.carListing.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        media: true,
        seller: {
          select: publicSellerSelect
        }
      }
    });

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete listing
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const listing = await prisma.carListing.findUnique({
      where: { id: req.params.id }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found' }
      });
    }

    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to delete this listing' }
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.carListing.delete({ where: { id: req.params.id } });

      // Return the slot to the user's active subscription so deleting a
      // listing doesn't consume a spot permanently.
      const activeSub = await tx.subscription.findFirst({
        where: {
          userId: req.user.id,
          isActive: true,
          endDate: { gt: new Date() },
          listingsUsed: { gt: 0 },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (activeSub) {
        await tx.subscription.update({
          where: { id: activeSub.id },
          data: { listingsUsed: { decrement: 1 } },
        });
      }
    });

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/listings/:id/favorite
 * @desc    Toggle favorite status
 * @access  Private
 */
router.post('/:id/favorite', authenticate, async (req, res, next) => {
  try {
    const listing = await prisma.carListing.findFirst({
      where: {
        id: req.params.id,
        status: 'ACTIVE'
      },
      select: { id: true }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found' }
      });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: req.user.id,
          listingId: req.params.id
        }
      }
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.$transaction([
        prisma.favorite.delete({
          where: { id: existingFavorite.id }
        }),
        prisma.carListing.update({
          where: { id: req.params.id },
          data: { favoritesCount: { decrement: 1 } }
        })
      ]);

      return res.json({
        success: true,
        message: 'Removed from favorites',
        data: { isFavorited: false }
      });
    } else {
      // Add favorite
      await prisma.$transaction([
        prisma.favorite.create({
          data: {
            userId: req.user.id,
            listingId: req.params.id
          }
        }),
        prisma.carListing.update({
          where: { id: req.params.id },
          data: { favoritesCount: { increment: 1 } }
        })
      ]);

      return res.json({
        success: true,
        message: 'Added to favorites',
        data: { isFavorited: true }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
