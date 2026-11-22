import dotenv from 'dotenv';
dotenv.config();

const config ={
  host:process.env.HOST || "",
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "",
  database_port:process.env.DATABASE_PORT || 5432,
  database_name:process.env.DATABASE_NAME || "",
  corsOrigins:(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  trustProxy:process.env.TRUST_PROXY === 'true',
  rateLimitWindowMs:Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax:Number(process.env.RATE_LIMIT_MAX) || 100,
  authRateLimitMax:Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
};

export default config;
