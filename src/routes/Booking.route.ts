import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { BookingController } from "@/controllers";
import {
  BookingCreateSchema,
  BookingDesktopSchema,
  BookingMobileSchema,
  BookingUpdateSchema,
} from "@/schema";
import { Router } from "express";
import upload from "@/utils/upload.util";
import { uploadMultiple } from "@/middlewares/upload.middleware";
import { authorizationMobile } from "@/middlewares/auth.middleware";

const route = Router();

route.post(
  "/BookingDesktop",
  asyncHandler(validateResource(BookingDesktopSchema)),
  asyncHandler(BookingController.bookingDesktop)
);

route.post(
  "/Cancel/:id",
  asyncHandler(authorizationMobile),
  asyncHandler(BookingController.cancel)
);

route.get("/GetByHourId/:id", asyncHandler(BookingController.getByHourId));

route.post(
  "/BookingMobile",
  [
    asyncHandler(authorizationMobile),
    upload.array("images"),
    asyncHandler(uploadMultiple("bookingImages")),
    asyncHandler(validateResource(BookingMobileSchema)),
  ],
  asyncHandler(BookingController.bookingMobile)
);

route.get(
  "/GetHistoryBooking/:patientId",
  asyncHandler(authorizationMobile),
  asyncHandler(BookingController.getAllMobile)
);

route
  .route("/")
  .post(asyncHandler(validateResource(BookingCreateSchema)), asyncHandler(BookingController.create))
  .get(asyncHandler(BookingController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(BookingUpdateSchema)),
    asyncHandler(BookingController.update)
  )
  .delete(asyncHandler(BookingController.delete))
  .get(asyncHandler(BookingController.getById));

export default route;
