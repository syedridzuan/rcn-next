export const config = {
  upload: {
    directory: process.env.UPLOAD_DIR || 'public/uploads/recipes',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    allowedTypes: (process.env.ALLOWED_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },
} as const;

// Validate configuration
function validateConfig() {
  const { upload } = config;

  if (!upload.directory) {
    throw new Error('UPLOAD_DIR is required');
  }

  if (isNaN(upload.maxFileSize) || upload.maxFileSize <= 0) {
    throw new Error('MAX_FILE_SIZE must be a positive number');
  }

  if (upload.allowedTypes.length === 0) {
    throw new Error('ALLOWED_TYPES must contain at least one mime type');
  }
}

// Validate on startup
validateConfig(); 