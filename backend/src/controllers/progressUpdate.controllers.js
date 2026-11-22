import progressUpdateServices from '../sevices/progressUpdate.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const verifyProgressUpdate = asyncHandler(async (req, res) => {
  const data = await progressUpdateServices.verifyProgressUpdate(
    req.user,
    req.params.id,
    req.body,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, 'Progress verified successfully', data));
});

const requestCorrection = asyncHandler(async (req, res) => {
  const data = await progressUpdateServices.requestCorrection(
    req.user,
    req.params.id,
    req.body.note,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Correction requested successfully', data));
});

export default { verifyProgressUpdate, requestCorrection };
