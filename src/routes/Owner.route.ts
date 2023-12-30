import { OwnerController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { authorization } from "@/middlewares/auth.middleware";
import { OwnerCreateSchema, OwnerUpdateProfileSchema, OwnerUpdateSchema } from "@/schema";
import {
  AuthChangePassWordSchema,
  AuthForgotPassWordSchema,
  AuthLoginSchema,
  AuthResetPassWordSchema,
} from "@/schema/Auth.schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(asyncHandler(validateResource(OwnerCreateSchema)), asyncHandler(OwnerController.create))
  .get(asyncHandler(OwnerController.getAll));

route.post(
  "/login",
  asyncHandler(validateResource(AuthLoginSchema)),
  asyncHandler(OwnerController.login)
);

route.post(
  "/forgotPassword",
  asyncHandler(validateResource(AuthForgotPassWordSchema)),
  asyncHandler(OwnerController.forgotPassword)
);

route.post(
  "/resetPassword/:id/:token",
  asyncHandler(validateResource(AuthResetPassWordSchema)),
  asyncHandler(OwnerController.resetPassword)
);

route.patch(
  "/changePassword/:id",
  [asyncHandler(authorization("owner")), asyncHandler(validateResource(AuthChangePassWordSchema))],
  asyncHandler(OwnerController.changePassword)
);

route.post(
  "/refreshToken",
  asyncHandler(authorization("owner")),
  asyncHandler(OwnerController.refreshToken)
);

route.patch(
  "/updateProfile/:id",
  asyncHandler(authorization("owner")),
  asyncHandler(validateResource(OwnerUpdateProfileSchema)),
  asyncHandler(OwnerController.updateProfile)
);

route.get(
  "/getProfile",
  asyncHandler(authorization("owner")),
  asyncHandler(OwnerController.getProfile)
);

route.post("/logout", asyncHandler(authorization("owner")), asyncHandler(OwnerController.logout));

route
  .route("/:id")
  .patch(asyncHandler(validateResource(OwnerUpdateSchema)), asyncHandler(OwnerController.update))
  .delete(asyncHandler(OwnerController.delete))
  .get(asyncHandler(OwnerController.getById));

export default route;
