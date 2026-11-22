import { z } from "zod";
import ApiResponse from "../utils/apiResponse.js";

const validate = (schema, source = "body") => (req, res, next) => {
  if (!["body", "query", "params"].includes(source)) {
    return next(new Error(`Invalid validation source: ${source}`));
  }

  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const formattedError = z.flattenError(result.error);
    return res
      .status(400)
      .json(new ApiResponse(400, "Validation failed", formattedError));
  }

  if (source === "query") {
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
  }

  req[source] = result.data;
  next();
};

export default validate;