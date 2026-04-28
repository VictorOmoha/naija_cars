const express = require('express');
const { authenticate, requireVerified } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const mediaService = require('../services/mediaService');
const prisma = require('../lib/prisma');

const router = express.Router();

const parseImageDataUrl = (imageData) => {
  if (!imageData || typeof imageData !== 'string') {
    throw new Error('No image data provided');
  }

  const match = imageData.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error('Invalid image data. Please choose a JPEG, PNG, or WebP image.');
  }

  return Buffer.from(match[2], 'base64');
};

const verifyListingOwner = async (listingId, userId) => {
  const listing = await prisma.carListing.findUnique({
    where: { id: listingId }
  });

  if (!listing) {
    const error = new Error('Listing not found');
    error.status = 404;
    throw error;
  }

  if (listing.sellerId !== userId) {
    const error = new Error('You do not have permission to upload media for this listing');
    error.status = 403;
    throw error;
  }

  return listing;
};

/**
 * @route   POST /api/media/upload
 * @desc    Upload multiple media files for a listing
 * @access  Private (Verified users only)
 */
router.post('/upload',
  authenticate,
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
      await verifyListingOwner(listingId, req.user.id);

      // Check existing media count by type
      const [existingPhotoCount, existingVideoCount] = await Promise.all([
        prisma.media.count({ where: { listingId, mediaType: 'PHOTO' } }),
        prisma.media.count({ where: { listingId, mediaType: 'VIDEO' } })
      ]);

      const newPhotoCount = files.filter(f => f.mimetype.startsWith('image/')).length;
      const newVideoCount = files.filter(f => f.mimetype.startsWith('video/')).length;

      if (existingPhotoCount + newPhotoCount > 20) {
        return res.status(400).json({
          success: false,
          error: { message: `Maximum 20 photos allowed. You have ${existingPhotoCount} and are uploading ${newPhotoCount}.` }
        });
      }

      if (existingVideoCount + newVideoCount > 3) {
        return res.status(400).json({
          success: false,
          error: { message: `Maximum 3 videos allowed. You have ${existingVideoCount} and are uploading ${newVideoCount}.` }
        });
      }

      // Upload files
      const uploadedMedia = [];
      const failedUploads = [];
      let displayOrder = existingPhotoCount + existingVideoCount;

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
          console.error('Error uploading file:', error.message);
          failedUploads.push(file.originalname || 'unknown');
        }
      }

      // If ALL files failed, return a real error so frontend knows
      if (uploadedMedia.length === 0) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'All file uploads failed. Please check media storage configuration and try again.',
            failed: failedUploads
          }
        });
      }

      res.status(201).json({
        success: true,
        message: `${uploadedMedia.length} file(s) uploaded successfully${failedUploads.length > 0 ? ` (${failedUploads.length} failed)` : ''}`,
        data: { media: uploadedMedia }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/media/upload-data
 * @desc    Upload listing images from compressed data URLs
 * @access  Private
 */
router.post('/upload-data', authenticate, async (req, res, next) => {
  try {
    const { listingId, images } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Listing ID is required' }
      });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No images uploaded' }
      });
    }

    await verifyListingOwner(listingId, req.user.id);

    const [existingPhotoCount, existingVideoCount] = await Promise.all([
      prisma.media.count({ where: { listingId, mediaType: 'PHOTO' } }),
      prisma.media.count({ where: { listingId, mediaType: 'VIDEO' } })
    ]);

    if (existingPhotoCount + images.length > 20) {
      return res.status(400).json({
        success: false,
        error: { message: `Maximum 20 photos allowed. You have ${existingPhotoCount} and are uploading ${images.length}.` }
      });
    }

    const uploadedMedia = [];
    let displayOrder = existingPhotoCount + existingVideoCount;

    for (const image of images) {
      const imageData = typeof image === 'string' ? image : image?.imageData;
      const imageBuffer = parseImageDataUrl(imageData);

      if (imageBuffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: { message: 'Prepared listing photo is too large. Please choose a smaller image.' }
        });
      }

      const media = await mediaService.uploadImageBuffer(imageBuffer, listingId, displayOrder);
      uploadedMedia.push(media);
      displayOrder++;
    }

    res.status(201).json({
      success: true,
      message: `${uploadedMedia.length} photo(s) uploaded successfully`,
      data: { media: uploadedMedia }
    });
  } catch (error) {
    next(error);
  }
});

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
