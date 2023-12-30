import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { EquipmentController } from "@/controllers";
import { EquipmentCreateSchema, EquipmentUpdateSchema } from "@/schema";
import { Router } from "express";
import { uploadSingle } from "@/middlewares/upload.middleware";
import upload from "@/utils/upload.util";

const route = Router();

route
  .route("/")
  .post(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("amenities")),
      asyncHandler(validateResource(EquipmentCreateSchema)),
    ],
    asyncHandler(EquipmentController.create)
  )
  .get(asyncHandler(EquipmentController.getAll));

route
  .route("/:id")
  .patch(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("amenities")),
      asyncHandler(validateResource(EquipmentUpdateSchema)),
    ],
    asyncHandler(EquipmentController.update)
  )
  .delete(asyncHandler(EquipmentController.delete))
  .get(asyncHandler(EquipmentController.getById));

export default route;
