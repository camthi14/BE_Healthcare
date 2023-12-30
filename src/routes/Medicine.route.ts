import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { MedicineController } from "@/controllers";
import { MedicineCreateSchema, MedicineUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(MedicineCreateSchema)),
		asyncHandler(MedicineController.create)
	)
	.get(asyncHandler(MedicineController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(MedicineUpdateSchema)),
		asyncHandler(MedicineController.update)
	)
	.delete(asyncHandler(MedicineController.delete))
	.get(asyncHandler(MedicineController.getById));

export default route;