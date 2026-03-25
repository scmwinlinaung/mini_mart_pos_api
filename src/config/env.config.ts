import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiry: string;
  refreshExpiry: string;
}

interface PaginationConfig {
  defaultPageLimit: number;
  maxPageLimit: number;
}

const parseEnvNumber = (value: string | undefined, defaultValue: number): number => {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseEnvNumber(process.env.PORT, 3000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseEnvNumber(process.env.DB_PORT, 5432),
    database: process.env.DB_NAME || 'mini_mart_pos',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  } as DatabaseConfig,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your_access_token_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  } as JwtConfig,

  pagination: {
    defaultPageLimit: parseEnvNumber(process.env.DEFAULT_PAGE_LIMIT, 20),
    maxPageLimit: parseEnvNumber(process.env.MAX_PAGE_LIMIT, 100),
  } as PaginationConfig,
};

export default env;
