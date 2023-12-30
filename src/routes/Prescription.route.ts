import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PrescriptionController } from "@/controllers";
import {
  AddPrescriptionDetailsSchema,
  GetByExamCardIdSchema,
  GetByExamCardIdSchemaV2,
  PrescriptionCreateSchema,
  PrescriptionUpdateSchema,
  ReceivePrescriptionSchema,
} from "@/schema";
import { Router } from "express";

const route = Router();

route.get(
  "/GetByExamCardId",
  asyncHandler(validateResource(GetByExamCardIdSchema)),
  asyncHandler(PrescriptionController.getByExamCardId)
);

route.post(
  "/ReceivePrescription",
  asyncHandler(validateResource(ReceivePrescriptionSchema)),
  asyncHandler(PrescriptionController.receivePrescription)
);

route.get(
  "/GetByExamCardIdV2",
  asyncHandler(validateResource(GetByExamCardIdSchemaV2)),
  asyncHandler(PrescriptionController.getByExaminationCardId)
);

route.post(
  "/AddPrescriptionDetails",
  asyncHandler(validateResource(AddPrescriptionDetailsSchema)),
  asyncHandler(PrescriptionController.addPrescriptionDetails)
);

route
  .route("/")
  .post(
    asyncHandler(validateResource(PrescriptionCreateSchema)),
    asyncHandler(PrescriptionController.create)
  )
  .get(asyncHandler(PrescriptionController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(PrescriptionUpdateSchema)),
    asyncHandler(PrescriptionController.update)
  )
  .delete(asyncHandler(PrescriptionController.delete))
  .get(asyncHandler(PrescriptionController.getById));

export default route;
