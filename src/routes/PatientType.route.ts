import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PatientTypeController } from "@/controllers";
import { PatientTypeCreateSchema, PatientTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(PatientTypeCreateSchema)),
    asyncHandler(PatientTypeController.create)
  )
  .get(asyncHandler(PatientTypeController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(PatientTypeUpdateSchema)),
    asyncHandler(PatientTypeController.update)
  )
  .delete(asyncHandler(PatientTypeController.delete))
  .get(asyncHandler(PatientTypeController.getById));

export default route;
