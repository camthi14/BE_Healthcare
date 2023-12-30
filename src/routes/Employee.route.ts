import { EmployeeController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { authorization } from "@/middlewares/auth.middleware";
import { uploadSingle } from "@/middlewares/upload.middleware";
import { EmployeeCreateSchema, EmployeeUpdateProfileSchema } from "@/schema";
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

route
  .route("/")
  .post(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("avatars")),
      asyncHandler(validateResource(EmployeeCreateSchema)),
    ],
    asyncHandler(EmployeeController.create)
  )
  .get(asyncHandler(EmployeeController.getAll));

route.post(
  "/refreshToken",
  asyncHandler(authorization("employee")),
  asyncHandler(EmployeeController.refreshToken)
);

route.patch(
  "/changePassword/:id",
  [
    asyncHandler(authorization("employee")),
    asyncHandler(validateResource(AuthChangePassWordSchema)),
  ],
  asyncHandler(EmployeeController.changePassword)
);

route.post(
  "/forgotPassword",
  asyncHandler(validateResource(AuthForgotPassWordSchema)),
  asyncHandler(EmployeeController.forgotPassword)
);

route.post(
  "/resetPassword/:id/:token",
  asyncHandler(validateResource(AuthResetPassWordSchema)),
  asyncHandler(EmployeeController.resetPassword)
);

route.post(
  "/login",
  asyncHandler(validateResource(AuthLoginSchema)),
  asyncHandler(EmployeeController.login)
);

route.patch(
  "/updateProfile/:id",
  [
    upload.single("photo"),
    asyncHandler(uploadSingle("avatars")),
    asyncHandler(validateResource(EmployeeUpdateProfileSchema)),
  ],
  asyncHandler(EmployeeController.updateProfile)
);

route.get(
  "/getProfile",
  asyncHandler(authorization("employee")),
  asyncHandler(EmployeeController.getProfile)
);

route.post(
  "/logout",
  asyncHandler(authorization("employee")),
  asyncHandler(EmployeeController.logout)
);

route
  .route("/:id")
  .patch(
    [
      upload.single("photo"),
      asyncHandler(uploadSingle("avatars")),
      asyncHandler(validateResource(EmployeeUpdateProfileSchema)),
    ],
    asyncHandler(EmployeeController.update)
  )
  .delete(asyncHandler(EmployeeController.delete))
  .get(asyncHandler(EmployeeController.getById));

export default route;
