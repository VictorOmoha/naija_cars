const express = require('express');
const { body, query, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticate, requireUserType } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', details: errors.array() }
    });
  }
  next();
};

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
      success: true,
      data: {
        totalUsers,
        activeListings,
        pendingApproval,
        totalRevenue: totalSubscriptions._sum.amountPaid || 0,
        userGrowth: parseFloat(userGrowth),
        listingGrowth: parseFloat(listingGrowth)
      }
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

    res.json({ success: true, data: listings });
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

    res.json({ success: true, data: sanitizedUsers });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch recent users' }
    });
  }
});

// ===== Get Single User =====
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        _count: { select: { listings: true, favorites: true } }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch user' } });
  }
});

// ===== Update User Profile =====
router.put('/users/:id', [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phoneNumber').optional().trim(),
  body('businessName').optional().trim(),
  body('bio').optional().trim(),
  body('location').optional().trim(),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, businessName, bio, location } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Update phone on user if provided
    if (phoneNumber !== undefined) {
      await prisma.user.update({ where: { id }, data: { phoneNumber } });
    }

    // Update profile fields
    const profileData = {};
    if (firstName !== undefined) profileData.firstName = firstName;
    if (lastName !== undefined) profileData.lastName = lastName;
    if (businessName !== undefined) profileData.businessName = businessName;
    if (bio !== undefined) profileData.bio = bio;
    if (location !== undefined) profileData.location = location;

    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: id },
        update: profileData,
        create: { userId: id, ...profileData }
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, _count: { select: { listings: true } } }
    });

    const { passwordHash, ...safeUser } = updated;
    res.json({ success: true, message: 'User updated successfully', data: safeUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to update user' } });
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
      success: true,
      data: {
        users: sanitizedUsers,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
      }
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
router.patch('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  validate
], async (req, res) => {
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
      success: true,
      data: {
        listings,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
      }
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
router.patch('/listings/:id/featured', [
  body('isFeatured').isBoolean().withMessage('isFeatured must be a boolean'),
  validate
], async (req, res) => {
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

// Get single listing by ID (for editing) - MUST be before DELETE to avoid route conflicts
router.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.carListing.findUnique({
      where: { id },
      include: {
        seller: {
          include: { profile: true }
        },
        media: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found' }
      });
    }

    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch listing' }
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

// Create new listing (admin can create on behalf of any seller or as system listing)
router.post('/listings', [
  body('make').isString().isLength({ min: 1, max: 50 }).withMessage('make is required and must be 1-50 characters'),
  body('model').isString().isLength({ min: 1, max: 50 }).withMessage('model is required and must be 1-50 characters'),
  body('year').isInt({ min: 1900, max: 2030 }).withMessage('year must be an integer between 1900 and 2030'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be a number greater than 0'),
  body('listingType').isIn(['SALE', 'RENT']).withMessage('listingType must be SALE or RENT'),
  body('condition').isIn(['FOREIGN_USED', 'NIGERIAN_USED', 'BRAND_NEW']).withMessage('condition must be FOREIGN_USED, NIGERIAN_USED, or BRAND_NEW'),
  body('trim').optional().isString().trim(),
  body('mileage').optional({ values: 'null' }).isInt({ min: 0 }).withMessage('mileage must be a non-negative integer'),
  body('transmission').optional().isString().trim(),
  body('fuelType').optional().isString().trim(),
  body('locationState').optional().isString().trim(),
  body('locationCity').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('status').optional().isString().trim(),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('sellerId').optional().isString().trim(),
  validate
], async (req, res) => {
  try {
    const {
      sellerId,
      listingType,
      make,
      model,
      year,
      trim,
      mileage,
      transmission,
      fuelType,
      condition,
      price,
      locationState,
      locationCity,
      description,
      status = 'ACTIVE',
      isFeatured = false,
      images = []
    } = req.body;

    // Use admin's ID if no sellerId provided
    const actualSellerId = sellerId || req.user.id;

    // Verify seller exists
    const seller = await prisma.user.findUnique({ where: { id: actualSellerId } });
    if (!seller) {
      return res.status(400).json({
        success: false,
        error: { message: 'Seller not found' }
      });
    }

    // Create listing with media
    const listing = await prisma.carListing.create({
      data: {
        sellerId: actualSellerId,
        listingType,
        make,
        model,
        year: parseInt(year),
        trim,
        mileage: mileage ? parseInt(mileage) : null,
        transmission,
        fuelType,
        condition,
        price: parseFloat(price),
        locationState,
        locationCity,
        description,
        status,
        isFeatured,
        media: {
          create: images.map((url, index) => ({
            mediaType: 'PHOTO',
            url,
            displayOrder: index
          }))
        }
      },
      include: {
        seller: { include: { profile: true } },
        media: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create listing' }
    });
  }
});

// Update listing
router.put('/listings/:id', [
  body('make').optional().isString().isLength({ min: 1, max: 50 }).withMessage('make must be 1-50 characters'),
  body('model').optional().isString().isLength({ min: 1, max: 50 }).withMessage('model must be 1-50 characters'),
  body('year').optional().isInt({ min: 1900, max: 2030 }).withMessage('year must be an integer between 1900 and 2030'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('price must be a number greater than 0'),
  body('listingType').optional().isIn(['SALE', 'RENT']).withMessage('listingType must be SALE or RENT'),
  body('condition').optional().isIn(['FOREIGN_USED', 'NIGERIAN_USED', 'BRAND_NEW']).withMessage('condition must be FOREIGN_USED, NIGERIAN_USED, or BRAND_NEW'),
  body('trim').optional().isString().trim(),
  body('mileage').optional({ values: 'null' }).isInt({ min: 0 }).withMessage('mileage must be a non-negative integer'),
  body('transmission').optional().isString().trim(),
  body('fuelType').optional().isString().trim(),
  body('locationState').optional().isString().trim(),
  body('locationCity').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('status').optional().isString().trim(),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      listingType,
      make,
      model,
      year,
      trim,
      mileage,
      transmission,
      fuelType,
      condition,
      price,
      locationState,
      locationCity,
      description,
      status,
      isFeatured,
      images
    } = req.body;

    // Check listing exists
    const existingListing = await prisma.carListing.findUnique({
      where: { id },
      include: { media: true }
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found' }
      });
    }

    // Build update data
    const updateData = {};
    if (listingType !== undefined) updateData.listingType = listingType;
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) updateData.year = parseInt(year);
    if (trim !== undefined) updateData.trim = trim;
    if (mileage !== undefined) updateData.mileage = mileage ? parseInt(mileage) : null;
    if (transmission !== undefined) updateData.transmission = transmission;
    if (fuelType !== undefined) updateData.fuelType = fuelType;
    if (condition !== undefined) updateData.condition = condition;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (locationState !== undefined) updateData.locationState = locationState;
    if (locationCity !== undefined) updateData.locationCity = locationCity;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    // Update listing
    const listing = await prisma.carListing.update({
      where: { id },
      data: updateData,
      include: {
        seller: { include: { profile: true } },
        media: true
      }
    });

    // Handle images if provided (replace all)
    if (images !== undefined && Array.isArray(images)) {
      // Delete existing media
      await prisma.media.deleteMany({ where: { listingId: id } });

      // Create new media
      if (images.length > 0) {
        await prisma.media.createMany({
          data: images.map((url, index) => ({
            listingId: id,
            mediaType: 'PHOTO',
            url,
            displayOrder: index
          }))
        });
      }

      // Fetch updated listing with new media
      const updatedListing = await prisma.carListing.findUnique({
        where: { id },
        include: {
          seller: { include: { profile: true } },
          media: { orderBy: { displayOrder: 'asc' } }
        }
      });

      return res.json({
        success: true,
        message: 'Listing updated successfully',
        listing: updatedListing
      });
    }

    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update listing' }
    });
  }
});

// ===== Analytics Endpoints =====
router.get('/analytics/overview', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get daily user registrations for last 30 days
    const usersByDay = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Get daily listings for last 30 days
    const listingsByDay = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "CarListing"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Get listings by status
    const listingsByStatus = await prisma.carListing.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Get listings by type (SALE vs RENT)
    const listingsByType = await prisma.carListing.groupBy({
      by: ['listingType'],
      _count: { listingType: true }
    });

    // Get users by type
    const usersByType = await prisma.user.groupBy({
      by: ['userType'],
      _count: { userType: true }
    });

    // Get top locations
    const topLocations = await prisma.carListing.groupBy({
      by: ['locationState'],
      _count: { locationState: true },
      orderBy: { _count: { locationState: 'desc' } },
      take: 10
    });

    // Get top car makes
    const topMakes = await prisma.carListing.groupBy({
      by: ['make'],
      _count: { make: true },
      orderBy: { _count: { make: 'desc' } },
      take: 10
    });

    // Get most viewed listings
    const mostViewedListings = await prisma.carListing.findMany({
      take: 5,
      orderBy: { viewsCount: 'desc' },
      include: {
        seller: { include: { profile: true } },
        media: { take: 1 }
      }
    });

    res.json({
      usersByDay,
      listingsByDay,
      listingsByStatus: listingsByStatus.map(s => ({ status: s.status, count: s._count.status })),
      listingsByType: listingsByType.map(t => ({ type: t.listingType, count: t._count.listingType })),
      usersByType: usersByType.map(u => ({ type: u.userType, count: u._count.userType })),
      topLocations: topLocations.map(l => ({ state: l.locationState, count: l._count.locationState })),
      topMakes: topMakes.map(m => ({ make: m.make, count: m._count.make })),
      mostViewedListings
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch analytics' }
    });
  }
});

// ===== User Role Management =====
router.patch('/users/:id/role', [
  body('userType').isIn(['INDIVIDUAL_SELLER', 'DEALER', 'RENTAL_COMPANY', 'BUYER', 'ADMIN']).withMessage('userType must be one of: INDIVIDUAL_SELLER, DEALER, RENTAL_COMPANY, BUYER, ADMIN'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.body;

    // Prevent changing own role
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot change your own role' }
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { userType },
      include: { profile: true }
    });

    res.json({
      success: true,
      message: `User role updated to ${userType}`,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update user role' }
    });
  }
});

// ===== Get All Sellers (for listing creation dropdown) =====
router.get('/sellers', async (req, res) => {
  try {
    const sellers = await prisma.user.findMany({
      where: {
        userType: { in: ['INDIVIDUAL_SELLER', 'DEALER', 'RENTAL_COMPANY', 'ADMIN'] },
        isActive: true
      },
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });

    const sanitizedSellers = sellers.map(seller => ({
      id: seller.id,
      email: seller.email,
      userType: seller.userType,
      name: seller.profile?.businessName ||
            `${seller.profile?.firstName || ''} ${seller.profile?.lastName || ''}`.trim() ||
            seller.email
    }));

    res.json({ success: true, data: sanitizedSellers });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch sellers' }
    });
  }
});

module.exports = router;
