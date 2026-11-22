import mongoose from "mongoose";
import config from "./config.js";

const databaseConnection = async () => {
  try {
    if (!config.mongodbUri) {
      throw new Error("MONGODB_URI is missing in .env file");
    }

    await mongoose.connect(config.mongodbUri, {
      dbName: config.database_name,
    });

    console.log("MongoDB Atlas connected successfully!");
    console.log(`Database: ${mongoose.connection.name}`);

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default databaseConnection;