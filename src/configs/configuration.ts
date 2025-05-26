import * as process from 'node:process';

export default () => ({
  appUrl: process.env.APP_URL || 'https://localhost:3000',
  appName: process.env.APP_NAME || 'App Name',
  frontendAppUrl: process.env.FRONTEND_APP_URL || 'https://localhost:3000',
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  mode: process.env.NODE_ENV || 'develop',
  auth: {
    salt: +process.env.AUTH_SALT || 10,
  },
  database: {
    type: process.env.DB_CONNECTION || 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3000,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    sync: process.env.DB_SYNC === 'true',
    entities: ['**/*.entity{.ts,.js}'],
    debug: process.env.DB_DEBUG === 'true',
    dropSchema: process.env.DB_DROP_SCHEMA,
    ssl: process.env.DB_SSL === 'true',
  },
  logtail: {
    token: process.env.LOGTAIL_SOURCE_TOKEN || null,
    endpoint: process.env.LOGTAIL_ENDPOINT || 'URL_ADDRESS.logtail.com',
  },
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'accessTokenSecret',
      expire: process.env.JWT_ACCESS_EXPIRE || '5m',
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshTokenSecret',
      expire: process.env.JWT_REFRESH_EXPIRE || '10m',
    },
  },
});
