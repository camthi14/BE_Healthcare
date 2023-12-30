import { PoolConnection, raw } from "mysql2/promise";
import { ObjectType } from "./object.type";

enum DataTypesMySQLEnum {
  number = "number",
  enum = "enum",
  string = "string",
}

export type DataTypesMySQLInterface =
  | DataTypesMySQLEnum.number
  | DataTypesMySQLEnum.enum
  | DataTypesMySQLEnum.string;

export enum DataTypesMySQL {
  INT = "number",
  ENUM = "enum",
  TIMESTAMP = "string",
  VARCHAR = "string",
  TEXT = "string",
  DATETIME = "string",
  DATE = "string",
}

export function isDataTypesMySQL(value: string): value is keyof typeof DataTypesMySQL {
  return value in DataTypesMySQL;
}

export function isDataTypesMySQLEnum(value: string): value is keyof typeof DataTypesMySQLEnum {
  return value in DataTypesMySQLEnum;
}

export type FILE_EXTENSION_MODEL = ".model.ts";

export interface ResponseHandleSetup {
  filed: string;
  type: DataTypesMySQLInterface;
  values: string;
  required: boolean;
  unique: boolean;
}

export type ExecuteProps = {
  pool: PoolConnection;
  table: string;
};

export type CreateProps<DataType> = {
  data: DataType;
} & ExecuteProps;

export type ReadProps<Type> = {
  conditions: ObjectType<Type>;
  fillables: string[];
  select?: string;
  timestamps?: boolean;
} & ExecuteProps;

export type UpdateProps<DataType, DataTypeofKey> = {
  data: DataType;
  key: keyof DataTypeofKey;
  valueOfKey: number | string;
} & ExecuteProps;

export type DeleteProps<Type> = {
  conditions: ObjectType<Type>;
} & ExecuteProps;

export type RawSQL = ReturnType<(sql: string) => typeof raw>;

export const isRawSQL = (value: any): value is RawSQL => {
  if (typeof value === "object") {
    if (value?.hasOwnProperty("toSqlString")) {
      return true;
    }
  }

  return false;
};

export type Pagination = {
  limit: number;
  page: number;
  order?: string;
  groupBy?: string;
};

export type CreateBulkProps = {
  fillables: string[];
  data: any[];
  withId?: boolean;
} & ExecuteProps;
