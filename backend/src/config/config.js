import dotenv from 'dotenv';
dotenv.config();

const config ={
  host:process.env.HOST || "",
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "",
  database_port:process.env.DATABASE_PORT || 5432,
  database_name:process.env.DATABASE_NAME || "",
};

export default config;
