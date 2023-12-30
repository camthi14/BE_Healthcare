import { TokenPair } from "@/models";
import { AuthForgotPasswordInput, AuthResetPasswordParams } from "@/schema/Auth.schema";

export type UserTypes = "owner" | "employee" | "doctor" | "patient";

export interface RefreshTokenProps {
  type: UserTypes;
  tokenPair: TokenPair;
  refreshToken: string;
  userId: string | number;
}

export interface getProfile {
  userId: string | number;
}

export interface forgotPasswordProps {
  data: AuthForgotPasswordInput;
  type: UserTypes;
}

export interface resetPasswordProps {
  data: AuthResetPasswordParams["body"];
  token: string;
  userId: string | number;
}
