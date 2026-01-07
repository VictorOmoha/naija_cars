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

module.exports = {
  uploadSingle: upload.single('file'),
  uploadMultiple: upload.array('files', 20),
  uploadFields: upload.fields([
    { name: 'photos', maxCount: 20 },
    { name: 'videos', maxCount: 3 }
  ])
};
