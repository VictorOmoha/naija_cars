const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireUserType } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireUserType('ADMIN'));

// ===== Dashboard Stats =====
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get current stats
    const [totalUsers, activeListings, pendingApproval, totalSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.carListing.count({ where: { status: 'ACTIVE' } }),
      prisma.carListing.count({ where: { status: 'PENDING' } }),
      prisma.subscription.aggregate({
        where: { isActive: true },
        _sum: { amountPaid: true }
      })
    ]);

    // Get users from last 30 days vs previous 30 days for growth calc
    const [recentUsers, previousUsers] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      })
    ]);

    // Get listings from last 30 days vs previous 30 days
    const [recentListings, previousListings] = await Promise.all([
      prisma.carListing.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.carListing.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      })
    ]);

    // Calculate growth percentages
    const userGrowth = previousUsers > 0
      ? ((recentUsers - previousUsers) / previousUsers * 100).toFixed(1)
      : recentUsers > 0 ? 100 : 0;

    const listingGrowth = previousListings > 0
      ? ((recentListings - previousListings) / previousListings * 100).toFixed(1)
      : recentListings > 0 ? 100 : 0;

    res.json({
      totalUsers,
      activeListings,
      pendingApproval,
      totalRevenue: totalSubscriptions._sum.amountPaid || 0,
      userGrowth: parseFloat(userGrowth),
      listingGrowth: parseFloat(listingGrowth)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch statistics' }
    });
  }
});

// ===== Recent Listings for Dashboard =====
router.get('/listings/recent', async (req, res) => {
  try {
    const listings = await prisma.carListing.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          include: { profile: true }
        },
        media: {
          take: 1,
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    res.json(listings);
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch recent listings' }
    });
  }
});

// ===== Recent Users for Dashboard =====
router.get('/users/recent', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
        _count: { select: { listings: true } }
      }
    });

    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: user.profile,
      _count: user._count
    }));

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch recent users' }
    });
  }
});

// ===== Users Management =====
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      userType = '',
      status = ''
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        {
          profile: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { businessName: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    if (userType) {
      where.userType = userType;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'verified') {
      where.isVerified = true;
    } else if (status === 'unverified') {
      where.isVerified = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          _count: { select: { listings: true } }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: user.profile,
      _count: user._count
    }));

    res.json({
      users: sanitizedUsers,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch users' }
    });
  }
});

// Verify user
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: true },
      include: { profile: true }
    });

    res.json({
      success: true,
      message: 'User verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to verify user' }
    });
  }
});

// Toggle user active status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (id === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot deactivate your own account' }
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      include: { profile: true }
    });

    res.json({
      success: true,
      message: isActive ? 'User activated successfully' : 'User suspended successfully',
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update user status' }
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete your own account' }
      });
    }

    // Check if user is admin
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (targetUser?.userType === 'ADMIN') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete admin accounts' }
      });
    }

    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete user' }
    });
  }
});

// ===== Listings Management =====
router.get('/listings', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      listingType = '',
      condition = ''
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        {
          seller: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              {
                profile: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { businessName: { contains: search, mode: 'insensitive' } }
                  ]
                }
              }
            ]
          }
        }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (listingType) {
      where.listingType = listingType;
    }

    if (condition) {
      where.condition = condition;
    }

    const [listings, total] = await Promise.all([
      prisma.carListing.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            include: { profile: true }
          },
          media: {
            take: 1,
            orderBy: { displayOrder: 'asc' }
          }
        }
      }),
      prisma.carListing.count({ where })
    ]);

    res.json({
      listings,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch listings' }
    });
  }
});

// Approve listing
router.patch('/listings/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.carListing.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });

    res.json({
      success: true,
      message: 'Listing approved successfully',
      listing
    });
  } catch (error) {
    console.error('Error approving listing:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to approve listing' }
    });
  }
});

// Reject listing
router.patch('/listings/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.carListing.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });

    res.json({
      success: true,
      message: 'Listing rejected successfully',
      listing
    });
  } catch (error) {
    console.error('Error rejecting listing:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to reject listing' }
    });
  }
});

// Toggle featured status
router.patch('/listings/:id/featured', async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const listing = await prisma.carListing.update({
      where: { id },
      data: { isFeatured }
    });

    res.json({
      success: true,
      message: isFeatured ? 'Listing marked as featured' : 'Listing removed from featured',
      listing
    });
  } catch (error) {
    console.error('Error updating featured status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update featured status' }
    });
  }
});

// Delete listing
router.delete('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.carListing.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete listing' }
    });
  }
});

module.exports = router;
