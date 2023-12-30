import { env } from "config";
import { PoolOptions } from "mysql2";

export const accessRunSQL: PoolOptions = {
  host: env.DB_HOST,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  connectionLimit: env.DB_CONNECT_POOL,
  multipleStatements: true,
};
