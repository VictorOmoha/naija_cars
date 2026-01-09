const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Admin middleware - checks if user is an admin (for now, check if user is a DEALER with verification badge)
// In production, you'd want a proper admin role
const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });

    // For now, admins are verified dealers or we can check a specific email
    // In production, add an isAdmin field to the User model
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(user.email) ||
                    (user.userType === 'DEALER' && user.profile?.verificationBadge);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required' }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Admin
 */
router.get('/users', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, verified, active, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(type && { userType: type.toUpperCase() }),
      ...(verified !== undefined && { isVerified: verified === 'true' }),
      ...(active !== undefined && { isActive: active === 'true' }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } },
          { profile: { firstName: { contains: search, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search, mode: 'insensitive' } } },
          { profile: { businessName: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          _count: {
            select: {
              listings: true,
              bookings: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      ...user,
      passwordHash: undefined
    }));

    res.json({
      success: true,
      data: {
        users: sanitizedUsers,
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
 * @route   PUT /api/admin/users/:id/verify
 * @desc    Verify/unverify a user
 * @access  Admin
 */
router.put('/users/:id/verify', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { isVerified } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isVerified },
      include: { profile: true }
    });

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          passwordHash: undefined
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Activate/deactivate a user
 * @access  Admin
 */
router.put('/users/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      include: { profile: true }
    });

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          passwordHash: undefined
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/users/:id/badge
 * @desc    Grant/revoke verification badge
 * @access  Admin
 */
router.put('/users/:id/badge', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { verificationBadge } = req.body;

    const profile = await prisma.userProfile.update({
      where: { userId: req.params.id },
      data: { verificationBadge }
    });

    res.json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/listings
 * @desc    Get all listings with filters (including pending)
 * @access  Admin
 */
router.get('/listings', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status: status.toUpperCase() }),
      ...(type && { listingType: type.toUpperCase() }),
      ...(search && {
        OR: [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { seller: { email: { contains: search, mode: 'insensitive' } } }
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
                  firstName: true,
                  lastName: true,
                  verificationBadge: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
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
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/listings/:id/status
 * @desc    Update listing status (approve, reject, etc.)
 * @access  Admin
 */
router.put('/listings/:id/status',
  authenticate,
  requireAdmin,
  [
    body('status').isIn(['PENDING', 'ACTIVE', 'SOLD', 'RENTED', 'INACTIVE'])
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

      const listing = await prisma.carListing.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
        include: {
          seller: {
            include: { profile: true }
          }
        }
      });

      res.json({
        success: true,
        data: { listing }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/admin/listings/:id/feature
 * @desc    Feature/unfeature a listing
 * @access  Admin
 */
router.put('/listings/:id/feature', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { isFeatured } = req.body;

    const listing = await prisma.carListing.update({
      where: { id: req.params.id },
      data: { isFeatured }
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
 * @route   DELETE /api/admin/listings/:id
 * @desc    Delete a listing
 * @access  Admin
 */
router.delete('/listings/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
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
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
router.get('/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalListings,
      pendingListings,
      activeListings,
      totalBookings,
      pendingBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.carListing.count(),
      prisma.carListing.count({ where: { status: 'PENDING' } }),
      prisma.carListing.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } })
    ]);

    // Recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { profile: true }
    });

    const recentListings = await prisma.carListing.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          include: { profile: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalListings,
          pendingListings,
          activeListings,
          totalBookings,
          pendingBookings
        },
        recentUsers: recentUsers.map(u => ({ ...u, passwordHash: undefined })),
        recentListings
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
