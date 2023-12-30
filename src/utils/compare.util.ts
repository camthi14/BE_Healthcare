import { INVALID_SIGNATURE_CODE, JWT_EXPIRED_CODE } from "@/constants";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import JWT, { JwtPayload } from "jsonwebtoken";
import { getHourAndMinusCurrent } from "./common.util";
import { UnauthorizedRequestError } from "./error.util";

export const compareHashPassword = async (password: string, passwordHash: string) => {
  return await bcrypt.compare(password, passwordHash);
};

export const verifyJWT = <T extends object>(token: string, secureKey: string) => {
  try {
    const decode = JWT.verify(token, secureKey);
    return decode as T & JwtPayload;
  } catch (error: any) {
    let code: undefined | string;

    if (error?.message === "invalid signature") {
      code = INVALID_SIGNATURE_CODE;
    }

    if (error?.message === "jwt expired") {
      code = JWT_EXPIRED_CODE;
    }

    throw new UnauthorizedRequestError(error.message, undefined, code);
  }
};

export const handleCompareTimeWithCurrentTime = (hourStart: string, hourEnd: string, time = 0) => {
  const start = dayjs(getHourAndMinusCurrent(hourStart));
  const end = dayjs(getHourAndMinusCurrent(hourEnd));
  const current = dayjs();

  const startCompare = current.diff(start, "minutes", true);
  const endCompare = current.diff(end, "minutes", true);

  if (startCompare >= time || endCompare >= time) return true;

  return false;
};

export const handleCompareTimeWithTime = ({
  hourEnd,
  hourStart,
  options,
  time,
}: {
  hourStart: string;
  hourEnd: string;
  time: number;
  options: "rather" | "less";
}) => {
  const start = dayjs(getHourAndMinusCurrent(hourStart));
  const end = dayjs(getHourAndMinusCurrent(hourEnd));
  const current = dayjs();

  const startCompare = current.diff(start, "minutes", true);
  const endCompare = current.diff(end, "minutes", true);

  if (options === "rather") {
    if (startCompare >= time || endCompare >= time) return true;

    return false;
  }

  if (startCompare <= time || endCompare <= time) return true;

  return false;
};
