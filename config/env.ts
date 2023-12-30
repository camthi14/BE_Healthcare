import "dotenv/config";
import { cleanEnv, str, num, url } from "envalid";

const env = cleanEnv(process.env, {
  /**
   * ==================================
   * Server
   * ==================================
   */
  NODE_ENV: str({ default: "developer" }),

  /**
   * ==================================
   * Application
   * ==================================
   */
  APP_PORT: num({ default: 8888 }),
  APP_SECRET_SESSION: str({ default: "private_sessions_abc!!@@" }),

  /**
   * ==================================
   * Client
   * ==================================
   */
  CLIENT_ORIGIN_WEB: str({ default: "http://localhost:3000" }),

  /**
   * ==================================
   * Client
   * ==================================
   */
  CLIENT_ORIGIN_MOBILE: str({ default: "http://192.168.1.12:8081" }),

  /**
   * ==================================
   * Database
   * ==================================
   */
  DB_HOST: str({ default: "localhost" }),
  DB_USERNAME: str({ default: "root" }),
  DB_PASSWORD: str({ default: "" }),
  DB_NAME: str({ default: "example" }),
  DB_PORT: num({ default: 3306 }),
  DB_CONNECT_POOL: num({ default: 10 }),

  /**
   * ==================================
   * Log
   * ==================================
   */
  FOLDER_ROOT_LOG: str({ default: "logs" }),

  /**
   * ==================================
   * EXPIRES
   * ==================================
   */
  EXPIRES_IN_OTP_PATIENT: str({ default: "60s" }),

  EXPIRES_IN_PRIVATE_KEY: str({ default: "1w" }),
  EXPIRES_IN_PUBLIC_KEY: str({ default: "3d" }),

  /**
   * ==================================
   * Email Service
   * ==================================
   */
  EMAIL_ADDRESS: str({ default: "example@gmail.com" }),
  EMAIL_PASSWORD: str({ default: "example" }),
  EMAIL_TITLE: str({ default: "" }),

  /**
   * ==================================
   * Cloudinary Service
   * ==================================
   */
  CLOUDINARY_NAME: str({ default: "" }),
  CLOUDINARY_API_KEY: str({ default: "" }),
  CLOUDINARY_SECRET: str({ default: "" }),
  CLOUDINARY_URI: url({ default: "" }),

  /**
   * ==================================
   * Cloudinary Service
   * ==================================
   */
  CRON_ONE_HOUR: str({ default: "17" }),
  CRON_ONE_MIN: str({ default: "0" }),
});

export default env;
