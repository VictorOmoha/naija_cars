const express = require('express');
const { authenticate, requireVerified } = require('../middleware/auth');
const { uploadMultiple, uploadSingle } = require('../middleware/upload');
const mediaService = require('../services/mediaService');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   POST /api/media/upload
 * @desc    Upload multiple media files for a listing
 * @access  Private (Verified users only)
 */
router.post('/upload',
  authenticate,
  requireVerified,
  uploadMultiple,
  async (req, res, next) => {
    try {
      const { listingId } = req.body;
      const files = req.files;

      if (!listingId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Listing ID is required' }
        });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'No files uploaded' }
        });
      }

      // Verify listing ownership
      const listing = await prisma.carListing.findUnique({
        where: { id: listingId }
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
          error: { message: 'You do not have permission to upload media for this listing' }
        });
      }

      // Check existing media count
      const existingMediaCount = await prisma.media.count({
        where: { listingId }
      });

      const photoCount = files.filter(f => f.mimetype.startsWith('image/')).length;
      const videoCount = files.filter(f => f.mimetype.startsWith('video/')).length;

      if (existingMediaCount + files.length > 23) {
        return res.status(400).json({
          success: false,
          error: { message: 'Maximum 20 photos and 3 videos allowed per listing' }
        });
      }

      if (existingMediaCount + photoCount > 20) {
        return res.status(400).json({
          success: false,
          error: { message: 'Maximum 20 photos allowed per listing' }
        });
      }

      if (existingMediaCount + videoCount > 3) {
        return res.status(400).json({
          success: false,
          error: { message: 'Maximum 3 videos allowed per listing' }
        });
      }

      // Upload files
      const uploadedMedia = [];
      let displayOrder = existingMediaCount;

      for (const file of files) {
        try {
          let media;

          if (file.mimetype.startsWith('image/')) {
            mediaService.validateImage(file);
            media = await mediaService.uploadImage(file, listingId, displayOrder);
          } else if (file.mimetype.startsWith('video/')) {
            mediaService.validateVideo(file);
            media = await mediaService.uploadVideo(file, listingId, displayOrder);
          }

          uploadedMedia.push(media);
          displayOrder++;
        } catch (error) {
          console.error('Error uploading file:', error);
          // Continue with other files
        }
      }

      res.status(201).json({
        success: true,
        message: `${uploadedMedia.length} file(s) uploaded successfully`,
        data: { media: uploadedMedia }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete a media file
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
      include: {
        listing: {
          select: { sellerId: true }
        }
      }
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        error: { message: 'Media not found' }
      });
    }

    if (media.listing.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to delete this media' }
      });
    }

    await mediaService.deleteMedia(req.params.id);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/media/reorder
 * @desc    Reorder media files for a listing
 * @access  Private (Owner only)
 */
router.put('/reorder', authenticate, async (req, res, next) => {
  try {
    const { listingId, mediaOrders } = req.body;

    if (!listingId || !mediaOrders || !Array.isArray(mediaOrders)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid request data' }
      });
    }

    // Verify listing ownership
    const listing = await prisma.carListing.findUnique({
      where: { id: listingId }
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
        error: { message: 'You do not have permission to reorder media for this listing' }
      });
    }

    await mediaService.reorderMedia(listingId, mediaOrders);

    res.json({
      success: true,
      message: 'Media reordered successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/media/listing/:listingId
 * @desc    Get all media for a listing
 * @access  Public
 */
router.get('/listing/:listingId', async (req, res, next) => {
  try {
    const media = await mediaService.getListingMedia(req.params.listingId);

    res.json({
      success: true,
      data: { media }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
