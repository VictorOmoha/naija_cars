const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const prisma = require('../lib/prisma');

class MediaService {
  getPublicBaseUrl() {
    const baseUrl = process.env.SERVER_URL
      || process.env.RENDER_EXTERNAL_URL
      || `http://localhost:${process.env.PORT || 5000}`;

    return baseUrl.replace(/\/$/, '');
  }

  getPublicPath(relativeUrl) {
    const cleanRelativeUrl = relativeUrl.replace(/^\/+/, '');
    return path.join(__dirname, '../../public', cleanRelativeUrl);
  }

  saveLocalMedia(buffer, relativeDir, extension) {
    const safeExtension = extension.replace(/^\./, '') || 'bin';
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${safeExtension}`;
    const relativeUrl = `${relativeDir.replace(/^\/+|\/+$/g, '')}/${filename}`;
    const absolutePath = this.getPublicPath(relativeUrl);

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, buffer);

    return {
      url: `${this.getPublicBaseUrl()}/${relativeUrl}`,
      relativeUrl: `/${relativeUrl}`,
      absolutePath,
      size: buffer.length
    };
  }

  bufferToDataUrl(buffer, mimeType = 'image/jpeg') {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  getVideoExtension(file) {
    const originalExtension = path.extname(file.originalname || '').replace(/^\./, '').toLowerCase();

    if (originalExtension) {
      return originalExtension;
    }

    const extensionsByMimeType = {
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi'
    };

    return extensionsByMimeType[file.mimetype] || 'mp4';
  }

  async uploadImageBuffer(inputBuffer, listingId, displayOrder = 0) {
    try {
      // Compress image using Sharp
      const compressedBuffer = await sharp(inputBuffer)
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
      const thumbnailBuffer = await sharp(inputBuffer)
        .resize(400, 300, {
          fit: 'cover'
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const url = this.bufferToDataUrl(compressedBuffer);
      const thumbnailUrl = this.bufferToDataUrl(thumbnailBuffer);

      // Save to database
      const media = await prisma.media.create({
        data: {
          listingId,
          mediaType: 'PHOTO',
          url,
          thumbnailUrl,
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
   * Upload image to configured storage with compression
   */
  async uploadImage(file, listingId, displayOrder = 0) {
    return this.uploadImageBuffer(file.buffer, listingId, displayOrder);
  }

  /**
   * Upload video to configured storage
   */
  async uploadVideo(file, listingId, displayOrder = 0) {
    try {
      // Validate video duration (max 45 seconds)
      // Note: For production, use ffmpeg to check duration

      let url;
      let thumbnailUrl = null;

      if (cloudinary.isConfigured()) {
        const videoUpload = await this.uploadToCloudinary(
          file.buffer,
          `naija-cars/videos/${listingId}`,
          'video'
        );

        url = videoUpload.secure_url;
        thumbnailUrl = videoUpload.secure_url.replace(
          /\.(mp4|mov|avi)$/,
          '.jpg'
        );
      } else {
        const localVideo = this.saveLocalMedia(
          file.buffer,
          `uploads/videos/${listingId}`,
          this.getVideoExtension(file)
        );
        url = localVideo.url;
      }

      // Save to database
      const media = await prisma.media.create({
        data: {
          listingId,
          mediaType: 'VIDEO',
          url,
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
   * Delete media from configured storage and database
   */
  async deleteMedia(mediaId) {
    try {
      const media = await prisma.media.findUnique({
        where: { id: mediaId }
      });

      if (!media) {
        throw new Error('Media not found');
      }

      if (this.isDataUrl(media.url)) {
        // Image data URLs are stored directly in the database; deleting the row
        // below is enough.
      } else if (this.isLocalMediaUrl(media.url)) {
        this.deleteLocalMedia(media.url);

        if (media.thumbnailUrl) {
          this.deleteLocalMedia(media.thumbnailUrl);
        }
      } else {
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

  isLocalMediaUrl(url) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.pathname.startsWith('/uploads/');
    } catch (error) {
      return typeof url === 'string' && url.startsWith('/uploads/');
    }
  }

  isDataUrl(url) {
    return typeof url === 'string' && url.startsWith('data:');
  }

  deleteLocalMedia(url) {
    try {
      let pathname = url;

      try {
        pathname = new URL(url).pathname;
      } catch (error) {
        // Keep relative local URLs as-is.
      }

      const absolutePath = this.getPublicPath(pathname);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (error) {
      console.warn('Unable to delete local media file:', error.message);
    }
  }

  /**
   * Reorder media for a listing
   */
  async reorderMedia(listingId, mediaOrders) {
    try {
      // mediaOrders is an array of { id, displayOrder }
      const updatePromises = mediaOrders.map((item) =>
        prisma.media.updateMany({
          where: { id: item.id, listingId },
          data: { displayOrder: item.displayOrder }
        })
      );

      const results = await Promise.all(updatePromises);
      if (results.some((result) => result.count !== 1)) {
        throw new Error('One or more media items do not belong to this listing');
      }

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
