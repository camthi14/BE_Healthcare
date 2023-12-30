import { PatientController } from "@/controllers";
import { validateFile, validateResource } from "@/middlewares";
import { authorizationMobile } from "@/middlewares/auth.middleware";
import { uploadSingle } from "@/middlewares/upload.middleware";
import {
  AddRelationshipSchema,
  GetHistoryExamination,
  PatientChangePasswordSchema,
  PatientLoginMobileSchema,
  PatientRegisterDesktopSchema,
  PatientRegisterSchema,
  PatientUpdateProfileSchema,
  PatientUpdateSchema,
  PatientVerifyPhoneNumberSchema,
} from "@/schema";
import { asyncHandler } from "@/utils";
import upload from "@/utils/upload.util";
import { Router } from "express";

const route = Router();

route.get(
  "/GetHistoryExamination",
  asyncHandler(validateResource(GetHistoryExamination)),
  asyncHandler(PatientController.getHistoryExamination)
);

route.post(
  "/Relationship",
  [asyncHandler(authorizationMobile), asyncHandler(validateResource(AddRelationshipSchema))],
  asyncHandler(PatientController.addRelationship)
);

route.get(
  "/Relationship/:patientId",
  asyncHandler(authorizationMobile),
  asyncHandler(PatientController.getRelationship)
);

route.post(
  "/RefreshToken",
  asyncHandler(authorizationMobile),
  asyncHandler(PatientController.refreshTokenMobile)
);

route.post(
  "/LoginWithPhoneNumber",
  asyncHandler(validateResource(PatientLoginMobileSchema)),
  asyncHandler(PatientController.loginWithPhoneNumber)
);

route.post(
  "/patientNew",
  asyncHandler(validateResource(PatientRegisterDesktopSchema)),
  asyncHandler(PatientController.createPatientNew)
);

route
  .route("/")
  .post(
    asyncHandler(validateResource(PatientRegisterSchema)),
    asyncHandler(PatientController.create)
  )
  .get(asyncHandler(PatientController.getAll));

route.post(
  "/verify/phone-number/:patientId",
  asyncHandler(validateResource(PatientVerifyPhoneNumberSchema)),
  asyncHandler(PatientController.verifyPhoneNumber)
);

route.post(
  "/resend/phone-number/:patientId",
  asyncHandler(PatientController.resendVerifyPhoneNumber)
);

route.get(
  "/Profile",
  asyncHandler(authorizationMobile),
  asyncHandler(PatientController.getProfile)
);

route.patch(
  "/Profile/:id",
  [asyncHandler(authorizationMobile), asyncHandler(validateResource(PatientUpdateProfileSchema))],
  asyncHandler(PatientController.updateProfile)
);

route.patch(
  "/Password/Change/:id",
  [asyncHandler(authorizationMobile), asyncHandler(validateResource(PatientChangePasswordSchema))],
  asyncHandler(PatientController.changePassword)
);

route.post(
  "/ChangePhoto/:id",
  [
    asyncHandler(authorizationMobile),
    upload.single("photo"),
    validateFile("single", "photo"),
    asyncHandler(uploadSingle("avatars")),
  ],
  asyncHandler(PatientController.changePhoto)
);

route.post(
  "/LogoutMobile",
  asyncHandler(authorizationMobile),
  asyncHandler(PatientController.logoutMobile)
);

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(PatientUpdateSchema)),
    asyncHandler(PatientController.update)
  )
  .delete(asyncHandler(PatientController.delete))
  .get(asyncHandler(PatientController.getById));

export default route;
