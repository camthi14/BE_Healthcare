import dayjs from "dayjs";
import { raw } from "mysql2";

export const FORMAT_DATE_SQL = "YYYY-MM-DD HH:mm:ss";

export const parserBooleanSQL = (boolean: boolean) => (boolean ? 1 : 0);

export const parserBoolean = (boolean: 1 | 0 | boolean) => Boolean(boolean === 1);

export const isNotNull = () => raw("IS NOT NULL");

export const rawLike = (text: string) => raw(`LIKE '%${text}%'`);

export const dateFormat = (date?: Date | string, format = FORMAT_DATE_SQL) =>
  dayjs(date ? new Date(date) : undefined).format(format);

export const dateTimeSql = (date?: Date | string, format = FORMAT_DATE_SQL) =>
  dateFormat(date, format);
