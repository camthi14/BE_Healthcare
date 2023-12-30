import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ServiceController } from "@/controllers";
import { ServiceCreateSchema, ServiceUpdateSchema } from "@/schema";
import { Router } from "express";
import upload from "@/utils/upload.util";
import { uploadSingle } from "@/middlewares/upload.middleware";

const route = Router();

route
  .route("/")
  .post(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("servicePack")),
      asyncHandler(validateResource(ServiceCreateSchema)),
    ],
    asyncHandler(ServiceController.create)
  )
  .get(asyncHandler(ServiceController.getAll));

route
  .route("/:id")
  .patch(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("servicePack")),
      asyncHandler(validateResource(ServiceUpdateSchema)),
    ],
    asyncHandler(ServiceController.update)
  )
  .delete(asyncHandler(ServiceController.delete))
  .get(asyncHandler(ServiceController.getById));

export default route;
