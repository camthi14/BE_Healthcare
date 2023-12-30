import {
  AccessToken,
  CookiesDoctor,
  CookiesEmployee,
  CookiesOwner,
  INVALID_DECODE_AC_ID_CODE,
  INVALID_DECODE_RF_ID_CODE,
  MISSING_ACCESS_TOKEN_CODE,
  MISSING_CLIENT_ID_CODE,
  NOT_FOUND_TOKEN_PAIR_CODE,
} from "@/constants";
import { CommonRequest } from "@/helpers/request.helper";
import { TokenPair } from "@/models";
import { TokenPairService } from "@/services";
import {
  ForbiddenRequestError,
  NotFoundRequestError,
  UnauthorizedRequestError,
  verifyJWT,
} from "@/utils";
import { NextFunction, Response } from "express";
import { UserTypes } from "types";

const userType: Record<
  UserTypes,
  {
    refreshToken: string;
    xClientId: string;
    key: keyof TokenPair;
    accessToken: string;
    refreshTokenRoute: string;
    logoutRoute: string;
    parserId: (id: string) => string | number;
  }
> = {
  owner: {
    refreshToken: CookiesOwner.REFRESH_TOKEN_OWNER,
    xClientId: CookiesOwner.X_CLIENT_ID_OWNER,
    key: "owner_id",
    accessToken: AccessToken.owner,
    parserId: (id: string): number => +id,
    refreshTokenRoute: "/api/v1/Owners/refreshToken",
    logoutRoute: "/api/v1/Owners/logout",
  },
  employee: {
    refreshToken: CookiesEmployee.REFRESH_TOKEN_EMPLOYEE,
    xClientId: CookiesEmployee.X_CLIENT_ID_EMPLOYEE,
    key: "employee_id",
    accessToken: AccessToken.employee,
    parserId: function (id: string): string | number {
      return id;
    },
    refreshTokenRoute: "/api/v1/Employees/refreshToken",
    logoutRoute: "/api/v1/Employees/logout",
  },
  doctor: {
    refreshToken: CookiesDoctor.REFRESH_TOKEN_DOCTOR,
    xClientId: CookiesDoctor.X_CLIENT_ID_DOCTOR,
    key: "doctor_id",
    accessToken: AccessToken.doctor,
    parserId: function (id: string): string | number {
      return id;
    },
    refreshTokenRoute: "/api/v1/Doctors/refreshToken",
    logoutRoute: "/api/v1/Doctors/logout",
  },
  patient: {
    refreshToken: "rf_patient",
    xClientId: "patient",
    key: "patient_id",
    accessToken: AccessToken.patient,
    parserId: function (id: string): string | number {
      return id;
    },
    refreshTokenRoute: "/api/v1/Patients/RefreshToken",
    logoutRoute: "",
  },
};

/**
 * @description Authorization
 * 1. Check userId missing?
 * 2. Get tokenPair
 * 3. Check logout
 * 4. Check refresh token
 * 5. get accessToken
 * 6. verify Token
 * 7. check user in dbs?
 * 8. check keyStore with this userId?
 * 9. Ok all => return tokenPair, userId, refreshToken => next()
 * @param type
 * @returns
 */
export const authorization = (type: UserTypes) => {
  const headers = userType[type];
  return async (req: CommonRequest, res: Response, next: NextFunction) => {
    //1
    let xClientId = req.cookies[headers.xClientId]?.toString();

    if (!xClientId)
      throw new ForbiddenRequestError(
        `Thiếu id. Hãy truyền id \`${headers.xClientId}\` lên để xác định người dùng.`,
        undefined,
        MISSING_CLIENT_ID_CODE
      );

    xClientId = headers.parserId(xClientId);

    //2
    const tokenPair = await TokenPairService.findOne({ [headers.key]: xClientId });
    if (!tokenPair)
      throw new NotFoundRequestError(
        "Không tìm thấy mã token tương ứng.",
        undefined,
        NOT_FOUND_TOKEN_PAIR_CODE
      );

    //3

    if (req.originalUrl === headers.logoutRoute) {
      req.userId = xClientId;
      return next();
    }

    //4

    const refreshTokenWithoutCookie = req.headers[headers.refreshToken]?.toString();

    if (req.originalUrl === headers.refreshTokenRoute) {
      const refreshToken =
        refreshTokenWithoutCookie ?? req.cookies[headers.refreshToken]?.toString();

      if (refreshToken) {
        const decode = verifyJWT<{
          id: string | number;
        }>(refreshToken, tokenPair.private_key);

        if (decode.id !== xClientId)
          throw new ForbiddenRequestError(
            `Id = \`${xClientId}\` Không hợp lệ. Hãy đăng nhập.`,
            undefined,
            INVALID_DECODE_RF_ID_CODE
          );

        req.tokenPair = tokenPair;
        req.userId = xClientId;
        req.refreshToken = refreshToken;

        return next();
      }
    }
    //5
    const accessToken = req.headers[headers.accessToken]?.toString();

    if (!accessToken)
      throw new ForbiddenRequestError(
        `Không có mã token \`${headers.accessToken}\`. Hãy đăng nhập.`,
        undefined,
        MISSING_ACCESS_TOKEN_CODE
      );
    //6
    const decode = verifyJWT<{
      id: string | number;
    }>(accessToken, tokenPair.public_key);
    //8
    console.log(`decode => `, decode);

    if (decode.id !== xClientId)
      throw new ForbiddenRequestError(
        `Id=${decode.id} không hợp lý. Hãy đăng nhập lại.`,
        undefined,
        INVALID_DECODE_AC_ID_CODE
      );
    //9
    req.tokenPair = tokenPair;
    req.userId = xClientId;

    return next();
  };
};

export const authorizationMobile = async (
  req: CommonRequest,
  res: Response,
  next: NextFunction
) => {
  const headers = userType["patient"];

  // console.log(`headerConfig`, headers);

  let xClientId = req.headers[headers.xClientId]?.toString();

  if (!xClientId) {
    throw new ForbiddenRequestError(
      `Thiếu id. Hãy truyền id \`${headers.xClientId}\` lên để xác định người dùng.`,
      undefined,
      MISSING_CLIENT_ID_CODE
    );
  }

  const patientId = String(xClientId);

  // console.log(`userID `, userId);

  if (!patientId) {
    throw new ForbiddenRequestError(
      "Không tìm thấy mã token tương ứng.",
      undefined,
      MISSING_CLIENT_ID_CODE
    );
  }

  const tokenPair = await TokenPairService.findOne({ patient_id: patientId });

  // console.log(`tokenPair`, tokenPair);

  if (!tokenPair) {
    throw new NotFoundRequestError(
      "Không tìm thấy mã token tương ứng.",
      undefined,
      NOT_FOUND_TOKEN_PAIR_CODE
    );
  }

  // console.log(`req.originalUrl`, { url: req.originalUrl, headers: req.headers });

  if (req.originalUrl === "/api/v1/Patients/LogoutMobile") {
    req.tokenPair = tokenPair;
    req.userId = patientId;

    return next();
  }

  if (req.originalUrl === headers.refreshTokenRoute) {
    const refreshToken = req.headers[headers.refreshToken]?.toString();

    console.log(`refreshToken`, refreshToken);

    if (refreshToken) {
      const decode = verifyJWT<{ id: string }>(refreshToken, tokenPair.private_key);

      // console.log(`decode`, decode);

      if (patientId !== decode.id) {
        throw new ForbiddenRequestError(
          `Id = \`${xClientId}\` Không hợp lệ. Hãy đăng nhập.`,
          undefined,
          INVALID_DECODE_RF_ID_CODE
        );
      }

      req.tokenPair = tokenPair;
      req.userId = patientId;
      req.refreshToken = refreshToken;

      return next();
    }
  }

  const accessToken = req.headers[headers.accessToken]?.toString();

  if (!accessToken) {
    throw new UnauthorizedRequestError(
      `Không có mã token \`${headers.accessToken}\`. Hãy đăng nhập.`,
      undefined,
      MISSING_ACCESS_TOKEN_CODE
    );
  }

  console.log(`accessToken`, accessToken);

  const decode = verifyJWT<{ id: string }>(accessToken, tokenPair.public_key);

  // console.log(`decode access`, decode);

  if (decode.id !== patientId) {
    throw new ForbiddenRequestError(
      `Id=${decode.id} không hợp lý. Hãy đăng nhập lại.`,
      undefined,
      INVALID_DECODE_AC_ID_CODE
    );
  }

  req.tokenPair = tokenPair;
  req.userId = patientId;

  return next();
};
