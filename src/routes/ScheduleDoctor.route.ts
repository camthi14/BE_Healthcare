import { ScheduleDoctorController } from "@/controllers";
import { validateResource } from "@/middlewares";
import {
  DoctorCancelScheduleSchema,
  GetByDoctorAndDateSchema,
  ScheduleDoctorCreateMultipleSchema,
  ScheduleDoctorCreateSchema,
  ScheduleDoctorUpdateSchema,
} from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.get(
  "/GetByDoctorAndDates",
  asyncHandler(validateResource(GetByDoctorAndDateSchema)),
  asyncHandler(ScheduleDoctorController.getByDoctorAndDates)
);

route.post(
  "/DoctorCancel",
  asyncHandler(validateResource(DoctorCancelScheduleSchema)),
  asyncHandler(ScheduleDoctorController.doctorCancel)
);

route.post(
  "/Multiple",
  asyncHandler(validateResource(ScheduleDoctorCreateMultipleSchema)),
  asyncHandler(ScheduleDoctorController.createMultiple)
);

route
  .route("/")
  .post(
    asyncHandler(validateResource(ScheduleDoctorCreateSchema)),
    asyncHandler(ScheduleDoctorController.create)
  )
  .get(asyncHandler(ScheduleDoctorController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(ScheduleDoctorUpdateSchema)),
    asyncHandler(ScheduleDoctorController.update)
  )
  .delete(asyncHandler(ScheduleDoctorController.delete))
  .get(asyncHandler(ScheduleDoctorController.getById));

export default route;
