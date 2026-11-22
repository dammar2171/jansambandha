import { AppError } from "../utils/AppError.js";
import ApiResponse from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR]: ${req.method} ${req.url} ->`, err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  const status = err.status || err.statusCode;
  if (status >= 400 && status < 500 && err.expose) {
    return res.status(status).json(new ApiResponse(status, err.message));
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
    data: null,
  });
};

export default errorHandler;