const express = require('express');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const sharp = require('sharp');
const prisma = require('../lib/prisma');
const cloudinary = require('../config/cloudinary');
const { authenticate } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Detect whether real Cloudinary credentials have been provided
const CLOUDINARY_CONFIGURED =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your-api-key';

if (!CLOUDINARY_CONFIGURED) {
  console.warn(
    '[avatar] Cloudinary credentials not set — avatar uploads will be saved to local disk (dev mode).'
  );
}

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
 * @route   POST /api/users/me/avatar
 * @desc    Upload / replace profile avatar image
 * @access  Private
 */
router.post('/me/avatar',
  authenticate,
  uploadSingle,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No image file provided' }
        });
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid format. Only JPEG, PNG, and WebP are allowed.' }
        });
      }

      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: { message: 'Image too large. Maximum 5MB allowed.' }
        });
      }

      // Compress & square-crop to 400×400 JPEG
      const compressedBuffer = await sharp(req.file.buffer)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toBuffer();

      let avatarUrl;

      if (CLOUDINARY_CONFIGURED) {
        // --- Upload to Cloudinary ---
        avatarUrl = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: `naija-cars/avatars/${req.user.id}`, resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
          ).end(compressedBuffer);
        });
      } else {
        // --- Local disk fallback (development) ---
        const avatarsDir = path.join(__dirname, '../../public/avatars');
        if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

        const filename = `${req.user.id}.jpg`;
        fs.writeFileSync(path.join(avatarsDir, filename), compressedBuffer);

        const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        avatarUrl = `${baseUrl}/avatars/${filename}`;
      }

      // Persist URL in UserProfile — upsert in case the profile row is missing
      await prisma.userProfile.upsert({
        where: { userId: req.user.id },
        update: { avatarUrl },
        create: { userId: req.user.id, avatarUrl }
      });

      // Return fresh user object so the frontend can update its store
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true }
      });
      delete user.passwordHash;

      res.json({
        success: true,
        message: 'Avatar updated successfully',
        data: { avatarUrl, user }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile text fields
 * @access  Private
 */
router.put('/profile',
  authenticate,
  [
    body('firstName').optional().trim().isLength({ min: 2 }),
    body('lastName').optional().trim().isLength({ min: 2 }),
    body('about').optional().trim().isLength({ max: 500 }),
    body('bio').optional().trim().isLength({ max: 500 }),  // alias → about
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
          error: { message: 'Validation failed', details: errors.array() }
        });
      }

      const {
        firstName, lastName,
        about, bio,          // accept both; bio is the frontend field name
        address, city, state,
        businessName, phone
      } = req.body;

      // bio is the frontend field; about is the DB column — accept either
      const aboutValue = about !== undefined ? about : bio;

      // Update UserProfile
      await prisma.userProfile.update({
        where: { userId: req.user.id },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(aboutValue !== undefined && { about: aboutValue }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(businessName !== undefined && { businessName })
        }
      });

      // Update phone on the User row if provided
      if (phone !== undefined) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { phoneNumber: phone }
        });
      }

      // Return fresh user so the frontend can sync its store
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true }
      });
      delete user.passwordHash;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/users/dealers
 * @desc    Get all dealers / sellers with active listings
 * @access  Public
 */
router.get('/dealers', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userType: { in: ['DEALER', 'RENTAL_COMPANY', 'INDIVIDUAL_SELLER'] },
      isActive: true,
      listings: { some: { status: 'ACTIVE' } },
      ...(search && {
        OR: [
          { profile: { businessName: { contains: search, mode: 'insensitive' } } },
          { profile: { firstName: { contains: search, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search, mode: 'insensitive' } } },
          { profile: { city: { contains: search, mode: 'insensitive' } } },
          { profile: { state: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          _count: { select: { listings: { where: { status: 'ACTIVE' } } } }
        },
        orderBy: [
          { userType: 'asc' },   // DEALERs first
          { createdAt: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    // Strip sensitive fields
    const safeUsers = users.map(({ passwordHash, phoneNumber, ...u }) => u);

    res.json({
      success: true,
      data: {
        dealers: safeUsers,
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
