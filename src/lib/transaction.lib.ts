import { mysql } from "@/database";
import { objToString, strToArrForSelect } from "@/utils";
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket, format } from "mysql2/promise";
import { CreateBulkProps, CreateProps, DeleteProps, ReadProps, UpdateProps } from "types";

/**
 * @description use `raw` from `mysql2/promise` for parser query of sql
 * and use `format` from `mysql2/promise` for format query of sql maybe pass value in `format`
 *
 * @example
 * `1. Select id not null`
 * const idNotNull = raw('IS NOT NULL')
 * format('SELECT * FROM users WHERE id ?', [isNotNull])
 *
 * @example
 * `2. Update current timestamp and id`
 * const CURRENT_TIMESTAMP = raw('CURRENT_TIMESTAMP()');
 * format('UPDATE posts SET modified = ? WHERE id = ?', [CURRENT_TIMESTAMP, 42]);
 */
class Transaction {
  private pool: Pool;

  constructor() {
    this.pool = mysql.connection;
  }

  public getPoolTransaction = async () => await this.connection.getConnection();

  public releaseConnection = (pool: PoolConnection) => this.connection.releaseConnection(pool);

  public create = async <DataType>({ data, pool, table }: CreateProps<DataType>) => {
    let sql = "INSERT INTO ?? SET ?";
    const params = [table, data];
    sql = format(sql, params);
    const [response] = await pool.query<ResultSetHeader>(sql);
    return response.insertId;
  };

  public async createBulk({ pool, table, fillables, data, withId }: CreateBulkProps) {
    let fieldBulk = fillables;

    if (!withId) {
      fieldBulk = fillables.filter((f) => f !== "id");
    }

    let sql = "INSERT INTO ?? (??) VALUES ?";

    const params = [table, fieldBulk, data];

    sql = format(sql, params);

    const [response] = await pool.query<ResultSetHeader>(sql);

    return response.affectedRows !== 0;
  }

  public read = async <T>({
    conditions,
    pool,
    table,
    fillables,
    timestamps = false,
    select = "",
  }: ReadProps<T>) => {
    const { values, where } = objToString(conditions);
    const selects = strToArrForSelect(
      select,
      fillables.concat(timestamps ? ["created_at", "updated_at"] : [])
    );

    let sql = `SELECT ?? FROM ?? WHERE ${where}`;
    const params = [selects, table, ...values];
    sql = format(sql, params);

    const [rows] = await pool.query<RowDataPacket[]>(sql);
    return rows as T[];
  };

  public update = async <DataType, DataTypeofKey>({
    data,
    key,
    pool,
    table,
    valueOfKey,
  }: UpdateProps<DataType, DataTypeofKey>) => {
    let sql = "UPDATE ?? SET ? WHERE ??=?";
    const params = [table, data, key, valueOfKey];
    sql = format(sql, params);
    const [response] = await pool.execute<ResultSetHeader>(sql);
    return response.affectedRows === 0 ? false : true;
  };

  public delete = async <T>({ conditions, pool, table }: DeleteProps<T>) => {
    const { values, where } = objToString(conditions);
    let sql = `DELETE FROM ?? WHERE ${where}`;
    const params = [table, values];
    sql = format(sql, params);
    const [response] = await pool.execute<ResultSetHeader>(sql);
    return response.affectedRows === 0 ? false : true;
  };

  get connection() {
    return this.pool;
  }
}

export default Transaction;
