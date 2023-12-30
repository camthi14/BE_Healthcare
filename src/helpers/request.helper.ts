import { TokenPair } from "@/models";
import { Request } from "express";
import { UserTypes } from "types";

export interface CommonRequest<
  Params = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  tokenPair?: TokenPair;
  refreshToken?: string;
  userId?: number | string;
  imageId?: string | string[];
  apiKey?: string;
  role?: UserTypes;
}
