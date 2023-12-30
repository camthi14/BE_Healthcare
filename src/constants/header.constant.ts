import { CookieOptions } from "express";

export enum CookiesOwner {
  REFRESH_TOKEN_OWNER = "_rfo",
  X_CLIENT_ID_OWNER = "c_owner",
  X_API_KEY_OWNER = "_xko",
}

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "production" ? false : true,
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 3.154e10, // 1 year
};

export enum CookiesEmployee {
  REFRESH_TOKEN_EMPLOYEE = "_rfe",
  X_CLIENT_ID_EMPLOYEE = "c_employee",
}

export enum CookiesDoctor {
  REFRESH_TOKEN_DOCTOR = "_rfd",
  X_CLIENT_ID_DOCTOR = "c_doctor",
}

export enum AccessToken {
  owner = "_aco",
  employee = "_ace",
  doctor = "_acd",
  patient = "_acp",
}
