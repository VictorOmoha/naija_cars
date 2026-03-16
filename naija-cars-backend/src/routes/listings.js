const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticate, requireVerified } = require('../middleware/auth');

const router = express.Router();

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
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

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
            include: {
              profile: {
                select: {
                  businessName: true,
                  businessLogoUrl: true,
                  verificationBadge: true
                }
              }
            }
          }
        },
        skip,
        take: parseInt(limit),
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
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
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
    const listing = await prisma.carListing.findUnique({
      where: { id: req.params.id },
      include: {
        media: {
          orderBy: { displayOrder: 'asc' }
        },
        seller: {
          include: {
            profile: true
          }
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
        fuelType, bodyType, color, engineSize, features, condition, price,
        negotiable, locationState, locationCity, phone, whatsapp,
        vinNumber, description
      } = req.body;

      const listing = await prisma.carListing.create({
        data: {
          listingType, make, model,
          year: parseInt(year, 10),
          trim, title,
          mileage: mileage ? parseInt(mileage, 10) : null,
          transmission, fuelType,
          bodyType: bodyType || null,
          color: color || null,
          engineSize: engineSize || null,
          features: Array.isArray(features) ? features : [],
          condition,
          price: parseFloat(price),
          negotiable: negotiable !== undefined ? Boolean(negotiable) : true,
          locationState, locationCity,
          phone: phone || null,
          whatsapp: whatsapp || null,
          vinNumber, description,
          sellerId: req.user.id
        },
        include: {
          seller: {
            include: {
              profile: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
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
router.put('/:id', authenticate, async (req, res, next) => {
  try {
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
      'features', 'condition', 'price', 'negotiable',
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
    if (updateData.negotiable !== undefined) updateData.negotiable = Boolean(updateData.negotiable);
    if (updateData.features !== undefined) {
      updateData.features = Array.isArray(updateData.features) ? updateData.features : [];
    }

    const listing = await prisma.carListing.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        media: true,
        seller: {
          include: { profile: true }
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

    await prisma.carListing.delete({
      where: { id: req.params.id }
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
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });

      await prisma.carListing.update({
        where: { id: req.params.id },
        data: { favoritesCount: { decrement: 1 } }
      });

      return res.json({
        success: true,
        message: 'Removed from favorites',
        data: { isFavorited: false }
      });
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId: req.user.id,
          listingId: req.params.id
        }
      });

      await prisma.carListing.update({
        where: { id: req.params.id },
        data: { favoritesCount: { increment: 1 } }
      });

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
