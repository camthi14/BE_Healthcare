import { mysql } from "@/database";
import {
  InternalServerRequestError,
  objToString,
  paramToString,
  paramsSearchWithLike,
  removeNullObj,
  strToArrForSelect,
} from "@/utils";
import _ from "lodash";
import { format } from "mysql2/promise";
import { ObjectType, Pagination, ParamsExecuteProcedure } from "types";

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
abstract class Model {
  protected abstract table: string;
  protected abstract fillables: Array<string>;
  protected abstract timestamps: boolean;

  /** @description Phương thức tạo 1 bản ghi. Trả về id sau khi tạo. */
  public create = async <T>(data: T) => {
    let sql = "INSERT INTO ?? SET ?";

    const params = [this.table, data];

    sql = format(sql, params);

    try {
      const [response] = await mysql.executeResult(sql);

      return response.insertId;
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  };

  /** @description Phương thức tạo nhiều bản ghi. */
  public async createBulk(data: Array<Array<string | number>>) {
    const fieldBulk = this.fillables.filter((f) => f !== "id");

    let sql = "INSERT INTO ?? (??) VALUES ?";

    const params = [this.table, fieldBulk, data];

    sql = format(sql, params);

    try {
      const [response] = await mysql.executeResult(sql);

      return response.affectedRows !== 0;
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  }

  /** @description Phương thức cập nhật 1 bản ghi */
  public async update<T, K>(data: T, value: number | string, key?: keyof K) {
    let sql = "UPDATE ?? SET ? WHERE ??=?";

    const params = [this.table, data, key ?? "id", value];

    sql = format(sql, params);

    try {
      const [response] = await mysql.executeResult(sql);

      return response.affectedRows === 0 ? false : true;
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  }

  /** @description Phương thức xóa 1 bản ghi theo id */
  public async deleteById(id: number | string) {
    let sql = "DELETE FROM ?? WHERE ??=?";

    const params = [this.table, "id", id];

    sql = format(sql, params);
    try {
      const [response] = await mysql.executeResult(sql);

      return response.affectedRows === 0 ? false : true;
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  }

  /** @description Phương thức xóa bản ghi */
  public async delete<T>(conditions: ObjectType<T>) {
    const { values, where } = objToString(conditions);

    let sql = `DELETE FROM ?? WHERE ${where}`;

    const params = [this.table, values];

    sql = format(sql, params);
    try {
      const [response] = await mysql.executeResult(sql);

      return response.affectedRows === 0 ? false : true;
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  }

  /** @description Phương thức lấy 1 danh sách bản ghi */
  public async findAll<T>(
    filter?: Record<string, any>,
    select = "",
    options?: Partial<Pagination>,
    distinct = false
  ) {
    let sql = "SELECT ?? FROM ??";

    if (distinct) {
      sql = "SELECT DISTINCT ?? FROM ??";
    }

    const selects = strToArrForSelect(
      select,
      this.fillables.concat(this.timestamps ? ["created_at", "updated_at"] : [])
    );

    let params: any[] = [selects, this.table];

    if (!_.isEmpty(filter)) {
      const { values, where } = objToString(paramsSearchWithLike(filter));
      sql += ` WHERE ${where}`;
      params = [...params, ...values];
    }

    // console.log(`options`, { options, filter });

    if (options && !_.isEmpty(options)) {
      const { order, limit, page, groupBy } = options;

      if (groupBy) {
        sql += ` GROUP BY \`${groupBy}\``;
      }

      if (order) {
        const slipt = order.split(",");
        const key = slipt[0];
        const sort = slipt[1] ? slipt[1] : "DESC";
        sql += ` ORDER BY \`${key}\` ${sort.toUpperCase()}`;
      }

      if (page && limit) {
        if (limit !== 9999) {
          const offset = (page - 1) * limit;
          sql += ` LIMIT ? OFFSET ?`;
          params = [...params, limit, offset];
        }
      }
    }

    sql = format(sql, params);

    // console.log(sql);

    try {
      const [rows] = await mysql.queryRows(sql);
      return rows as T[];
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  }

  public async count(filters?: Record<string, any>) {
    let sql = "SELECT COUNT(*) as count FROM ??";
    let params: any[] = [this.table];

    if (!_.isEmpty(filters)) {
      const { values, where } = objToString(paramsSearchWithLike(filters));
      sql += ` WHERE ${where}`;
      params = [...params, ...values];
    }

    sql = format(sql, params);

    try {
      const [rows] = await mysql.queryRows(sql);
      return (rows[0] as { count: number }).count;
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  }

  /** @description Phương thức lấy 1 bản ghi theo điều kiện */
  public async findOne<T>(conditions: ObjectType<T>, select = "") {
    const { values, where } = objToString(paramsSearchWithLike(removeNullObj(conditions)));

    const selects = strToArrForSelect(
      select,
      this.fillables.concat(this.timestamps ? ["created_at", "updated_at"] : [])
    );

    let sql = `SELECT ?? FROM ?? WHERE ${where}`;

    const params = [selects, this.table, ...values];

    sql = format(sql, params);

    try {
      const [rows] = await mysql.queryRows(sql);

      return rows.length ? (rows[0] as T) : false;
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  }

  public buildQuery(fncName: string, params: ParamsExecuteProcedure) {
    return `CALL \`${fncName}\`` + "(" + paramToString(params) + ")";
  }

  public async callProd<T>(procedureName: string, params: ParamsExecuteProcedure = []) {
    const query = this.buildQuery(procedureName, params);

    try {
      const [rows] = await mysql.queryRowsAsArray(query, params);

      return rows[0] as T[];
    } catch (error: any) {
      console.log(`sql error => `, query);
      throw new InternalServerRequestError(error.message);
    }
  }

  public async query<Response>(sql: string) {
    try {
      const [rows] = await mysql.executeRows(sql);

      return rows as Response[];
    } catch (error: any) {
      console.log(`sql error => `, sql);
      throw new InternalServerRequestError(error.message);
    }
  }
}

export default Model;
