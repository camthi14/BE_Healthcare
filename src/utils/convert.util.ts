import { raw } from "mysql2";
import { ParamsExecuteProcedure, isRawSQL } from "types";

/** @description Chuyển đổi từ object sang chuỗi hỗ trợ query mysql */
export const objToString = (obj: { [key: string]: any }) => {
  let values: Array<string> = [];
  let where: string = "";

  Object.keys(obj).forEach((key, index) => {
    if (index > 0) {
      where += " AND ";
    }
    if (isRawSQL(obj[key])) {
      where += `\`${key}\` ?`;
    } else {
      where += `\`${key}\` = ?`;
    }

    values = [...values, obj[key]];
  });

  return { where, values };
};

/** @description Chuyển đổi từ string sang array hỗ trợ query select mysql */
export const strToArrForSelect = (select: string, fillables: Array<string>) => {
  if (!select) return fillables;

  let fillablesTemp: Array<string> = [];
  let result: Array<string> = [];

  const selectToObj = select
    .split(" ")
    .reduce((obj, value) => (obj = { ...obj, [value]: value }), {});

  Object.keys(selectToObj).forEach((key) => {
    const keyCut = key.split("-");

    if (keyCut[0] === "" || !keyCut[0]) {
      if (fillablesTemp.length) {
        fillablesTemp = [...fillablesTemp.filter((fill) => fill !== keyCut[1])];
      } else {
        fillablesTemp = [...fillables.filter((fill) => fill !== keyCut[1])];
      }
    } else {
      result = [...result, keyCut[0]];
    }
  });

  return result.length ? result : fillablesTemp;
};

/** @description Convert mảng sang chuỗi query */
export const paramToString = (params: ParamsExecuteProcedure) => {
  let paramStr = "";
  let count = params.length;
  for (let idx = 0; idx < count; idx++) {
    if (idx == count - 1) {
      paramStr += JSON.stringify(params[idx]);
    } else {
      paramStr += JSON.stringify(params[idx]) + ", ";
    }
  }
  return paramStr;
};

export const getDisplayName = (firstName: string, lastName: string) => `${lastName} ${firstName}`;

export const paramsSearchWithLike = (object: Record<string, any>) => {
  Object.keys(object).forEach((key) => {
    if (key.match(/_like/)) {
      const newKey = key.slice(0, key.length - 5);
      object = { ...object, [newKey]: raw(`LIKE '%${object[key]}%'`) };
      delete object[key];
    }
  });

  return object;
};
