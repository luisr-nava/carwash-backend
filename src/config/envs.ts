import { Logger } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DB_PORT: number;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  FRONTEND_ORIGIN: string;
  //   DB_HOST: string;
  //   DB_USER: string;
}

const logger = new Logger('FactuPulse - ERROR');
const envSchema = joi
  .object({
    PORT: joi.number().required(),
    DB_PORT: joi.number().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    GOOGLE_CLIENT_ID: joi.string().required(),
    GOOGLE_CLIENT_SECRET: joi.string().required(),
    GOOGLE_REDIRECT_URI: joi.string().required(),
    FRONTEND_ORIGIN: joi.string().required(),
    // DB_HOST: joi.string().required(),
    // DB_USER: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  logger.error(error);
  console.log(error.message);

  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  dbPort: envVars.DB_PORT,
  dbPassword: envVars.DB_PASSWORD,
  dbName: envVars.DB_NAME,
  jwtSecret: envVars.JWT_SECRET,
  clientID: envVars.GOOGLE_CLIENT_ID,
  clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: envVars.GOOGLE_REDIRECT_URI,
  frontendOrigin: envVars.FRONTEND_ORIGIN,
  //   dbHost: envVars.DB_HOST,
  //   dbUsername: envVars.DB_USER,
};
