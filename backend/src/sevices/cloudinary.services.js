import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';

const DEFAULT_FOLDER = 'jansambandha';

const ensureConfigured = () => {
  if (!isCloudinaryConfigured) {
    throw new AppError('Cloudinary is not configured', 503);
  }
};

const toDataUri = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

const toUploadResult = (result) => ({
  url: result.secure_url,
  publicId: result.public_id,
  resourceType: result.resource_type,
  width: result.width,
  height: result.height,
  bytes: result.bytes,
});

const performUpload = async (file, folder) => {
  if (!file) {
    throw new AppError('No file provided', 400);
  }
  ensureConfigured();

  try {
    const result = await cloudinary.uploader.upload(toDataUri(file), {
      folder,
      resource_type: 'auto',
    });
    return toUploadResult(result);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('File upload failed', 502);
  }
};

const uploadFile = async (file, folder = DEFAULT_FOLDER) =>
  performUpload(file, folder);

const uploadFiles = async (files, folder = DEFAULT_FOLDER) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new AppError('No files provided', 400);
  }
  ensureConfigured();
  return Promise.all(files.map((file) => performUpload(file, folder)));
};

const deleteFile = async (publicId, resourceType = 'image') => {
  if (!publicId) {
    throw new AppError('No public ID provided', 400);
  }
  ensureConfigured();

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return { result: result.result };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('File deletion failed', 502);
  }
};

export default { uploadFile, uploadFiles, deleteFile };
