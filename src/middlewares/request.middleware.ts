import { BadRequestError } from "@/utils";
import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import expressRateLimit from "express-rate-limit";

export const validateResource =
  (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        // files: req.files,
        // file: req.file,
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error: any) {
      const others = error?.issues?.reduce(
        (obj: { [key: string]: string }, i: any) =>
          (obj = { ...obj, [i.path[1] || i.path[0]]: i.message }),
        {}
      );
      throw new BadRequestError("Thiếu dữ liệu", undefined, others);
    }
  };

export const validateFile = (type: "single" | "array", key: string) => {
  return (req: Request, _: Response, next: NextFunction) => {
    if (type === "single" && !req.file)
      throw new BadRequestError(`Trường ${key} không được bỏ trống.`);

    if (type === "array" && (!req.files || !req.files?.length))
      throw new BadRequestError(`Trường ${key} không được bỏ trống.`);

    return next();
  };
};

/**
 * @description Limit request api
 * @param requestNumber Limit each IP to `Max Number Request`
 * @param timer Default `60000 ms (= 1 minute).`
 */
export const rateLimit = (requestNumber: number, timer: number, message?: string) => {
  const time = timer >= 60 ? "giờ" : timer >= 60 * 24 ? "ngày" : "phút";

  return expressRateLimit({
    max: requestNumber,
    windowMs: timer * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    message: message ?? `Quá nhiều request. Vui lòng thử lại sau ${timer} ${time}`,
  });
};
