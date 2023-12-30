import { ExaminationCardController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { authorizationMobile } from "@/middlewares/auth.middleware";
import {
  ConfirmExaminationSchema,
  ExaminationCardCreateSchema,
  ExaminationCardUpdateSchema,
  GetExaminationCardDetailsSchema,
  GetPatientForDateSchema,
  GetRequiredSchema,
  PaymentServiceSchema,
  RequiredExaminationSchema,
  ServiceExaminationCreateSchema,
} from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.get("/GetPatientInformation", asyncHandler(ExaminationCardController.getInformationPatient));

route.get(
  "/GetPatientForDate",
  asyncHandler(validateResource(GetPatientForDateSchema)),
  asyncHandler(ExaminationCardController.getPatientForDate)
);

route.get(
  "/GetByBookingId/:bookingId",
  asyncHandler(authorizationMobile),
  asyncHandler(ExaminationCardController.getExaminationByBookingId)
);

route.get(
  "/GetExaminationCardDetails",
  asyncHandler(validateResource(GetExaminationCardDetailsSchema)),
  asyncHandler(ExaminationCardController.getExaminationCardDetails)
);

route.get(
  "/GetExaminationForDate",
  asyncHandler(validateResource(GetPatientForDateSchema)),
  asyncHandler(ExaminationCardController.getExaminationForDate)
);

route.get(
  "/GetRequired",
  asyncHandler(validateResource(GetRequiredSchema)),
  asyncHandler(ExaminationCardController.getRequired)
);

route.post(
  "/Payment",
  asyncHandler(validateResource(PaymentServiceSchema)),
  asyncHandler(ExaminationCardController.payment)
);

route.post(
  "/RequiredExaminationSubclinical",
  asyncHandler(validateResource(RequiredExaminationSchema)),
  asyncHandler(ExaminationCardController.requiredExaminationSubclinical)
);

route.post(
  "/ConfirmExamination",
  asyncHandler(validateResource(ConfirmExaminationSchema)),
  asyncHandler(ExaminationCardController.confirmExamination)
);

route.post(
  "/AddServiceConfirm",
  asyncHandler(validateResource(ServiceExaminationCreateSchema)),
  asyncHandler(ExaminationCardController.addServiceConfirm)
);

route
  .route("/")
  .post(
    asyncHandler(validateResource(ExaminationCardCreateSchema)),
    asyncHandler(ExaminationCardController.create)
  )
  .get(asyncHandler(ExaminationCardController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(ExaminationCardUpdateSchema)),
    asyncHandler(ExaminationCardController.update)
  )
  .delete(asyncHandler(ExaminationCardController.delete))
  .get(asyncHandler(ExaminationCardController.getById));

export default route;
