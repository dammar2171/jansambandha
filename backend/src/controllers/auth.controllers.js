import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js"

const registerUser = asyncHandler(async(req,res)=>{
  const data = "hello"
  res.status(200).json(new ApiResponse(200, "message.", data));
})

export default {registerUser}