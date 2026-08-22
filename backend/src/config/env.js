const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (isProduction && (!value || value.includes('change-me') || value.includes('example') || value.includes('localhost'))) {
    throw new Error(`Missing or insecure production value for ${key}`);
  }

  return value || '';
};

const frontendUrls = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv,
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwtAccessSecret: getRequiredEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: getRequiredEnv('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || frontendUrls[0] || '',
  corsOrigins: frontendUrls,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
};
