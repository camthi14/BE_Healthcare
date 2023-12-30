import { env } from "config";
import { PoolOptions } from "mysql2/promise";
import MySQL from "./instant.db";

const access: PoolOptions = {
  host: env.DB_HOST,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT,
  connectionLimit: env.DB_CONNECT_POOL,
  multipleStatements: true,
};

const mysql: MySQL = new MySQL(access);

export default mysql;
