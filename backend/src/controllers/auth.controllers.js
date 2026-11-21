import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js"
import authServices from "../sevices/auth.services.js";

const registerCitizen = asyncHandler(async(req,res)=>{
  const data = await authServices.registerCitizen(req.body);
  res.status(201).json(new ApiResponse(201, "Citizen registered successfully", data));
})

export default { registerCitizen };