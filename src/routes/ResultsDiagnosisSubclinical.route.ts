import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ResultsDiagnosisSubclinicalController } from "@/controllers";
import {
  GetByCardDetailIdSchema,
  ResultsDiagnosisSubclinicalCreateSchema,
  ResultsDiagnosisSubclinicalUpdateSchema,
} from "@/schema";
import { Router } from "express";
import upload from "@/utils/upload.util";
import { uploadMultiple } from "@/middlewares/upload.middleware";

const route = Router();

route.get(
  "/GetByCardDetailId",
  asyncHandler(validateResource(GetByCardDetailIdSchema)),
  asyncHandler(ResultsDiagnosisSubclinicalController.getByCardDetailId)
);

route
  .route("/")
  .post(
    [
      upload.array("images"),
      asyncHandler(uploadMultiple("resultImages")),
      asyncHandler(validateResource(ResultsDiagnosisSubclinicalCreateSchema)),
    ],
    asyncHandler(ResultsDiagnosisSubclinicalController.create)
  )
  .get(asyncHandler(ResultsDiagnosisSubclinicalController.getAll));

route
  .route("/:id")
  .patch(
    [
      upload.array("images"),
      asyncHandler(uploadMultiple("resultImages")),
      asyncHandler(validateResource(ResultsDiagnosisSubclinicalUpdateSchema)),
    ],
    asyncHandler(ResultsDiagnosisSubclinicalController.update)
  )
  .delete(asyncHandler(ResultsDiagnosisSubclinicalController.delete))
  .get(asyncHandler(ResultsDiagnosisSubclinicalController.getById));

export default route;
