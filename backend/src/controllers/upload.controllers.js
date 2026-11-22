import cloudinaryServices from '../sevices/cloudinary.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const uploadImage = asyncHandler(async (req, res) => {
  const data = await cloudinaryServices.uploadFile(req.file);

  return res
    .status(201)
    .json(new ApiResponse(201, 'File uploaded successfully', data));
});

const uploadImages = asyncHandler(async (req, res) => {
  const data = await cloudinaryServices.uploadFiles(req.files);

  return res
    .status(201)
    .json(new ApiResponse(201, 'Files uploaded successfully', data));
});

export default { uploadImage, uploadImages };
