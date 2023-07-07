import path from 'path';
import dotenv from 'dotenv'
import logger from './logging';

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, '../config/config.env') });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  NODE_ENV: string | undefined;
  DATABASE_URL: string | undefined;
  EMAIL_API: string | undefined;
  EMAIL_HOST: string | undefined;
  EMAIL_PORT: number | undefined;
  EMAIL_USERNAME: string | undefined;
  EMAIL_SENDER: string | undefined;
  BASE_URL: string | undefined;
}

interface Config {
  NODE_ENV: string;
  DATABASE_URL: string;
  EMAIL_API: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USERNAME: string;
  EMAIL_SENDER: string;
  BASE_URL: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    EMAIL_API: process.env.EMAIL_API,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT
      ? Number(process.env.EMAIL_PORT)
      : undefined,
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_SENDER: process.env.EMAIL_SENDER,
    BASE_URL: process.env.BASE_URL,
  };
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitizedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      logger.error(`Missing key ${key} in config.env`);
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitizedConfig(config);

export default sanitizedConfig;
