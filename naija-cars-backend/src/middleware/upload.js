const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 20 // Max 20 files
  }
});

// Wrap multer middleware with proper error handling
const handleMulterError = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      const messages = {
        LIMIT_FILE_SIZE: 'File too large. Maximum size is 50MB per file.',
        LIMIT_FILE_COUNT: 'Too many files. Maximum is 20 files per upload.',
        LIMIT_UNEXPECTED_FILE: 'Unexpected file field name.',
      };
      return res.status(400).json({
        success: false,
        error: { message: messages[err.code] || `Upload error: ${err.message}` }
      });
    }
    if (err) {
      // Non-multer errors (e.g., file filter rejection)
      return res.status(400).json({
        success: false,
        error: { message: err.message || 'File upload failed.' }
      });
    }
    next();
  });
};

module.exports = {
  uploadSingle: handleMulterError(upload.single('file')),
  uploadMultiple: handleMulterError(upload.array('files', 20)),
  uploadFields: handleMulterError(upload.fields([
    { name: 'photos', maxCount: 20 },
    { name: 'videos', maxCount: 3 }
  ]))
};
