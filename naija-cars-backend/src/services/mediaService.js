const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');
const prisma = require('../lib/prisma');

class MediaService {
  /**
   * Upload image to Cloudinary with compression
   */
  async uploadImage(file, listingId, displayOrder = 0) {
    try {
      // Compress image using Sharp
      const compressedBuffer = await sharp(file.buffer)
        .resize(1200, 900, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer();

      // Create thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(400, 300, {
          fit: 'cover'
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload to Cloudinary
      const mainUpload = await this.uploadToCloudinary(
        compressedBuffer,
        `naija-cars/listings/${listingId}`
      );

      const thumbnailUpload = await this.uploadToCloudinary(
        thumbnailBuffer,
        `naija-cars/thumbnails/${listingId}`
      );

      // Save to database
      const media = await prisma.media.create({
        data: {
          listingId,
          mediaType: 'PHOTO',
          url: mainUpload.secure_url,
          thumbnailUrl: thumbnailUpload.secure_url,
          displayOrder,
          fileSize: compressedBuffer.length
        }
      });

      return media;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  /**
   * Upload video to Cloudinary
   */
  async uploadVideo(file, listingId, displayOrder = 0) {
    try {
      // Validate video duration (max 45 seconds)
      // Note: For production, use ffmpeg to check duration

      // Upload video to Cloudinary
      const videoUpload = await this.uploadToCloudinary(
        file.buffer,
        `naija-cars/videos/${listingId}`,
        'video'
      );

      // Generate thumbnail from video
      const thumbnailUrl = videoUpload.secure_url.replace(
        /\.(mp4|mov|avi)$/,
        '.jpg'
      );

      // Save to database
      const media = await prisma.media.create({
        data: {
          listingId,
          mediaType: 'VIDEO',
          url: videoUpload.secure_url,
          thumbnailUrl,
          displayOrder,
          fileSize: file.size
        }
      });

      return media;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error(error.message || 'Failed to upload video');
    }
  }

  /**
   * Upload buffer to Cloudinary
   */
  async uploadToCloudinary(buffer, folder, resourceType = 'image') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          transformation: resourceType === 'video' ? [
            { duration: '45', fetch_format: 'mp4' }
          ] : undefined
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete media from Cloudinary and database
   */
  async deleteMedia(mediaId) {
    try {
      const media = await prisma.media.findUnique({
        where: { id: mediaId }
      });

      if (!media) {
        throw new Error('Media not found');
      }

      // Extract public ID from Cloudinary URL
      const publicId = this.extractPublicId(media.url);
      const thumbnailPublicId = media.thumbnailUrl ? this.extractPublicId(media.thumbnailUrl) : null;

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId, {
        resource_type: media.mediaType === 'VIDEO' ? 'video' : 'image'
      });

      if (thumbnailPublicId) {
        await cloudinary.uploader.destroy(thumbnailPublicId);
      }

      // Delete from database
      await prisma.media.delete({
        where: { id: mediaId }
      });

      return { message: 'Media deleted successfully' };
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media');
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = parts.slice(-3).join('/').replace(/\.[^/.]+$/, '');
    return publicId;
  }

  /**
   * Reorder media for a listing
   */
  async reorderMedia(listingId, mediaOrders) {
    try {
      // mediaOrders is an array of { id, displayOrder }
      const updatePromises = mediaOrders.map((item) =>
        prisma.media.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder }
        })
      );

      await Promise.all(updatePromises);

      return { message: 'Media reordered successfully' };
    } catch (error) {
      console.error('Error reordering media:', error);
      throw new Error('Failed to reorder media');
    }
  }

  /**
   * Get all media for a listing
   */
  async getListingMedia(listingId) {
    const media = await prisma.media.findMany({
      where: { listingId },
      orderBy: { displayOrder: 'asc' }
    });

    return media;
  }

  /**
   * Validate image file
   */
  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid image format. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('Image size too large. Maximum 10MB allowed.');
    }

    return true;
  }

  /**
   * Validate video file
   */
  validateVideo(file) {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid video format. Only MP4, MOV, and AVI are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('Video size too large. Maximum 50MB allowed.');
    }

    return true;
  }
}

module.exports = new MediaService();
