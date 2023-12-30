import { CommonRequest } from "@/helpers";
import { uploadImage } from "@/lib/cloudinary.lib";

import { NextFunction, Response } from "express";
import fs from "fs";

/**
 *
 * @param folder
 * @returns
 */
export const uploadSingle =
  (folder: string) => async (req: CommonRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return next();

      const response = await uploadImage(`${req.file.destination}/${req.file.filename}`, folder);
      fs.unlinkSync(`${req.file.destination}/${req.file.filename}`);

      req.imageId = response;
      return next();
    } catch (error) {
      throw error;
    }
  };

export const uploadMultiple =
  (folder: string) => async (req: CommonRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.files || req.files.length === 0) return next();

      const promise = (req.files as Express.Multer.File[]).map(
        (file: Express.Multer.File): Promise<string> =>
          new Promise(async (resolve, reject) => {
            try {
              const response = await uploadImage(`${file.destination}/${file.filename}`, folder);
              fs.unlinkSync(`${file.destination}/${file.filename}`);
              resolve(response);
            } catch (error) {
              reject(error);
            }
          })
      );

      const response = await Promise.all(promise);

      req.imageId = response;

      return next();
    } catch (error) {
      throw error;
    }
  };
