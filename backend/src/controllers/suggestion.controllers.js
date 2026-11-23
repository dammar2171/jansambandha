import suggestionServices from '../sevices/suggestion.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createSuggestion = asyncHandler(async (req, res) => {
  const data = await suggestionServices.createSuggestion(req.user, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, 'Suggestion submitted successfully', data));
});

const listSuggestions = asyncHandler(async (req, res) => {
  const data = await suggestionServices.listSuggestions(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Suggestions fetched successfully', data));
});

export default { createSuggestion, listSuggestions };
