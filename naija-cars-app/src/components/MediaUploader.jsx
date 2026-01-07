import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Video, MoveVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import api from '../services/api';

export default function MediaUploader({ listingId, initialMedia = [], onUploadComplete }) {
  const [files, setFiles] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Validate file count
    const photoCount = files.filter(f => f.mediaType === 'PHOTO').length;
    const videoCount = files.filter(f => f.mediaType === 'VIDEO').length;
    const newPhotoCount = acceptedFiles.filter(f => f.type.startsWith('image/')).length;
    const newVideoCount = acceptedFiles.filter(f => f.type.startsWith('video/')).length;

    if (photoCount + newPhotoCount > 20) {
      alert('Maximum 20 photos allowed per listing');
      return;
    }

    if (videoCount + newVideoCount > 3) {
      alert('Maximum 3 videos allowed per listing');
      return;
    }

    if (!listingId) {
      // Preview mode - just show files locally
      const previews = acceptedFiles.map((file) => ({
        id: Math.random().toString(36),
        file,
        preview: URL.createObjectURL(file),
        mediaType: file.type.startsWith('image/') ? 'PHOTO' : 'VIDEO',
        isLocal: true
      }));
      setFiles([...files, ...previews]);
      return;
    }

    // Upload to server
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('listingId', listingId);

      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const uploadedMedia = response.data.data.media;
      setFiles([...files, ...uploadedMedia]);

      if (onUploadComplete) {
        onUploadComplete(uploadedMedia);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [files, listingId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading
  });

  const removeFile = async (fileId, isLocal) => {
    if (isLocal) {
      // Remove local preview
      setFiles(files.filter(f => f.id !== fileId));
      return;
    }

    // Delete from server
    try {
      await api.delete(`/media/${fileId}`);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete media');
    }
  };

  const handleReorder = async (newOrder) => {
    setFiles(newOrder);

    if (!listingId) return; // Preview mode

    // Update order on server
    try {
      const mediaOrders = newOrder.map((file, index) => ({
        id: file.id,
        displayOrder: index
      }));

      await api.put('/media/reorder', {
        listingId,
        mediaOrders
      });
    } catch (error) {
      console.error('Reorder error:', error);
      alert('Failed to reorder media');
    }
  };

  const photoCount = files.filter(f => f.mediaType === 'PHOTO').length;
  const videoCount = files.filter(f => f.mediaType === 'VIDEO').length;

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                   transition-all ${
                     isDragActive
                       ? 'border-naija-500 bg-naija-50'
                       : 'border-pearl-300 hover:border-naija-400 bg-pearl-50'
                   } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        <Upload className="w-12 h-12 mx-auto mb-4 text-charcoal-400" />

        {uploading ? (
          <div>
            <p className="text-charcoal-700 font-medium mb-2">Uploading...</p>
            <div className="w-full max-w-xs mx-auto bg-pearl-200 rounded-full h-2">
              <div
                className="bg-naija-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-charcoal-500 mt-2">{uploadProgress}%</p>
          </div>
        ) : (
          <>
            {isDragActive ? (
              <p className="text-naija-600 font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-charcoal-700 font-medium mb-1">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-charcoal-500">
                  Up to 20 photos and 3 videos (Max 50MB each)
                </p>
                <p className="text-xs text-charcoal-400 mt-2">
                  Supported: JPEG, PNG, WebP, MP4, MOV, AVI
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* File Count */}
      {files.length > 0 && (
        <div className="flex gap-4 text-sm text-charcoal-600">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span>{photoCount}/20 Photos</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span>{videoCount}/3 Videos</span>
          </div>
        </div>
      )}

      {/* File Preview Grid with Reordering */}
      {files.length > 0 && (
        <Reorder.Group
          axis="y"
          values={files}
          onReorder={handleReorder}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {files.map((file) => (
              <Reorder.Item
                key={file.id}
                value={file}
                className="relative aspect-video bg-pearl-100 rounded-xl overflow-hidden
                         group cursor-move border-2 border-pearl-200 hover:border-naija-400
                         transition-all"
              >
                {/* Media Preview */}
                {file.mediaType === 'PHOTO' ? (
                  <img
                    src={file.isLocal ? file.preview : file.thumbnailUrl || file.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-charcoal-800">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity flex flex-col
                              justify-between p-3">
                  {/* Type Badge */}
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-charcoal-900/80 text-white text-xs rounded-lg">
                      {file.mediaType === 'PHOTO' ? 'Photo' : 'Video'}
                    </span>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id, file.isLocal);
                      }}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg
                               transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drag Handle */}
                  <div className="flex items-center justify-center">
                    <div className="p-1.5 bg-charcoal-900/80 rounded-lg">
                      <MoveVertical className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Display Order Badge */}
                <div className="absolute top-3 left-3 w-6 h-6 bg-naija-500 text-white
                              rounded-full flex items-center justify-center text-xs font-bold">
                  {files.indexOf(file) + 1}
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Helper Text */}
      {files.length > 0 && (
        <p className="text-xs text-charcoal-500 text-center">
          Drag items to reorder. The first image will be the cover photo.
        </p>
      )}
    </div>
  );
}
