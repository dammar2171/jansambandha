import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new AppError('Unsupported file type', 400));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
});

const handleUpload = (middleware) => (req, res, next) =>
  middleware(req, res, (err) => {
    if (!err) return next();
    if (err instanceof AppError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File is too large (max 5 MB)', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Too many or unexpected files', 400));
    }
    return next(new AppError('Invalid file upload', 400));
  });

export default {
  single: (field = 'file') => handleUpload(upload.single(field)),
  array: (field = 'files', maxCount = MAX_FILES) =>
    handleUpload(upload.array(field, maxCount)),
};
