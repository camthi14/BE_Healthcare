import { DoctorController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { authorization } from "@/middlewares/auth.middleware";
import { uploadSingle } from "@/middlewares/upload.middleware";
import {
  DoctorCreateSchema,
  DoctorUpdateProfileSchema,
  GetDoctorIdsSchema,
  GetPatientsSchema,
} from "@/schema";
import {
  AuthChangePassWordSchema,
  AuthForgotPassWordSchema,
  AuthLoginSchema,
  AuthResetPassWordSchema,
} from "@/schema/Auth.schema";
import { asyncHandler } from "@/utils";
import upload from "@/utils/upload.util";
import { Router } from "express";

const route = Router();

route.get(
  "/GetPatients",
  asyncHandler(validateResource(GetPatientsSchema)),
  asyncHandler(DoctorController.getPatients)
);

route
  .route("/")
  .post(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("avatars")),
      asyncHandler(validateResource(DoctorCreateSchema)),
    ],
    asyncHandler(DoctorController.create)
  )
  .get(asyncHandler(DoctorController.getAll));

route.post(
  "/refreshToken",
  asyncHandler(authorization("doctor")),
  asyncHandler(DoctorController.refreshToken)
);

route.patch(
  "/changePassword/:id",
  [asyncHandler(authorization("doctor")), asyncHandler(validateResource(AuthChangePassWordSchema))],
  asyncHandler(DoctorController.changePassword)
);

route.post(
  "/forgotPassword",
  asyncHandler(validateResource(AuthForgotPassWordSchema)),
  asyncHandler(DoctorController.forgotPassword)
);

route.post(
  "/resetPassword/:id/:token",
  asyncHandler(validateResource(AuthResetPassWordSchema)),
  asyncHandler(DoctorController.resetPassword)
);

route.use(
  "/login",
  asyncHandler(validateResource(AuthLoginSchema)),
  asyncHandler(DoctorController.login)
);

route.get(
  "/getProfile",
  asyncHandler(authorization("doctor")),
  asyncHandler(DoctorController.getProfile)
);

route.get("/getSchedule", asyncHandler(DoctorController.getSchedule));

route.post(
  "/getMultipleIDs",
  asyncHandler(validateResource(GetDoctorIdsSchema)),
  asyncHandler(DoctorController.getMultipleIDs)
);

route.patch(
  "/updateProfile/:id",
  [
    upload.single("photo"),
    asyncHandler(uploadSingle("avatars")),
    asyncHandler(authorization("doctor")),
    asyncHandler(validateResource(DoctorUpdateProfileSchema)),
  ],
  asyncHandler(DoctorController.updateProfile)
);

route.post("/logout", asyncHandler(authorization("doctor")), asyncHandler(DoctorController.logout));

route
  .route("/:id")
  .patch(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("avatars")),
      asyncHandler(validateResource(DoctorUpdateProfileSchema)),
    ],
    asyncHandler(DoctorController.update)
  )
  .delete(asyncHandler(DoctorController.delete))
  .get(asyncHandler(DoctorController.getById));

export default route;
