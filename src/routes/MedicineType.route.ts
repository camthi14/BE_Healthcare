import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { MedicineTypeController } from "@/controllers";
import { MedicineTypeCreateSchema, MedicineTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(MedicineTypeCreateSchema)),
		asyncHandler(MedicineTypeController.create)
	)
	.get(asyncHandler(MedicineTypeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(MedicineTypeUpdateSchema)),
		asyncHandler(MedicineTypeController.update)
	)
	.delete(asyncHandler(MedicineTypeController.delete))
	.get(asyncHandler(MedicineTypeController.getById));

export default route;