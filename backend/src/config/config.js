import dotenv from "dotenv";

dotenv.config();

const config = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 5000,

  // Authentication
  jwtSecret: process.env.JWT_SECRET || "",

  // Database
  database_name: process.env.DATABASE_NAME || "",
  mongodbUri: process.env.MONGODB_URI || "",
};

export default config;