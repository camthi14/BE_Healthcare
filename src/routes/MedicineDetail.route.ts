import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { MedicineDetailController } from "@/controllers";
import { MedicineDetailCreateSchema, MedicineDetailUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(MedicineDetailCreateSchema)),
		asyncHandler(MedicineDetailController.create)
	)
	.get(asyncHandler(MedicineDetailController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(MedicineDetailUpdateSchema)),
		asyncHandler(MedicineDetailController.update)
	)
	.delete(asyncHandler(MedicineDetailController.delete))
	.get(asyncHandler(MedicineDetailController.getById));

export default route;