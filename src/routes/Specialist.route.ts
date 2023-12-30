import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { SpecialistController } from "@/controllers";
import { GetDoctorSchema, SpecialistCreateSchema, SpecialistUpdateSchema } from "@/schema";
import { Router } from "express";
import { uploadSingle } from "@/middlewares/upload.middleware";
import upload from "@/utils/upload.util";

const route = Router();

route.get(
  "/GetDoctor",
  asyncHandler(validateResource(GetDoctorSchema)),
  asyncHandler(SpecialistController.getDoctor)
);

route
  .route("/")
  .post(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("specialties")),
      asyncHandler(validateResource(SpecialistCreateSchema)),
    ],

    asyncHandler(SpecialistController.create)
  )
  .get(asyncHandler(SpecialistController.getAll));

route
  .route("/:id")
  .patch(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("specialties")),
      asyncHandler(validateResource(SpecialistUpdateSchema)),
    ],
    asyncHandler(SpecialistController.update)
  )
  .delete(asyncHandler(SpecialistController.delete))
  .get(asyncHandler(SpecialistController.getById));

export default route;
