import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ExaminationCardsDetailController } from "@/controllers";
import { ExaminationCardsDetailCreateSchema, ExaminationCardsDetailUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(ExaminationCardsDetailCreateSchema)),
    asyncHandler(ExaminationCardsDetailController.create)
  )
  .get(asyncHandler(ExaminationCardsDetailController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(ExaminationCardsDetailUpdateSchema)),
    asyncHandler(ExaminationCardsDetailController.update)
  )
  .delete(asyncHandler(ExaminationCardsDetailController.delete))
  .get(asyncHandler(ExaminationCardsDetailController.getById));

export default route;
