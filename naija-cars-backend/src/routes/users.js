const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/me/favorites
 * @desc    Get user's favorite listings
 * @access  Private
 */
router.get('/me/favorites', authenticate, async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: {
            media: {
              orderBy: { displayOrder: 'asc' },
              take: 1
            },
            seller: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        favorites: favorites.map(f => f.listing)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/me/listings
 * @desc    Get all of the authenticated user's own listings (all statuses)
 * @access  Private
 */
router.get('/me/listings', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = {
      sellerId: req.user.id,
      ...(status && { status: status.toUpperCase() }),
      ...(type && { listingType: type.toUpperCase() })
    };

    const [listings, total] = await Promise.all([
      prisma.carListing.findMany({
        where,
        include: {
          media: {
            orderBy: { displayOrder: 'asc' },
            take: 1
          }
        },
        skip,
        take: parseInt(limit, 10),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.carListing.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / parseInt(limit, 10))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authenticate,
  [
    body('firstName').optional().trim().isLength({ min: 2 }),
    body('lastName').optional().trim().isLength({ min: 2 }),
    body('about').optional().trim().isLength({ max: 500 }),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('businessName').optional().trim()
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
        firstName,
        lastName,
        about,
        address,
        city,
        state,
        businessName
      } = req.body;

      const profile = await prisma.userProfile.update({
        where: { userId: req.user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(about !== undefined && { about }),
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(businessName && { businessName })
        }
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: true,
        _count: {
          select: {
            listings: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Remove sensitive data
    delete user.passwordHash;
    delete user.phoneNumber;

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/:id/listings
 * @desc    Get user's active listings
 * @access  Public
 */
router.get('/:id/listings', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, type } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = {
      sellerId: req.params.id,
      status: 'ACTIVE',
      ...(type && { listingType: type.toUpperCase() })
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
              profile: true
            }
          }
        },
        skip,
        take: parseInt(limit, 10),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.carListing.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / parseInt(limit, 10))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
