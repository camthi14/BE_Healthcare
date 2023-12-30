import { NextFunction, Request, Response } from "express";

export function asyncHandler(
  fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
