namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    DATABASE_URL: string;
    EMAIL_API: string;
    EMAIL_HOST: string;
    EMAIL_PORT: number;
    EMAIL_USERNAME: string;
    EMAIL_SENDER: string;
    BASE_URL: string;
  }
}
