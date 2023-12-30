import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { SubclinicalTypeController } from "@/controllers";
import { SubclinicalTypeCreateSchema, SubclinicalTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(SubclinicalTypeCreateSchema)),
		asyncHandler(SubclinicalTypeController.create)
	)
	.get(asyncHandler(SubclinicalTypeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(SubclinicalTypeUpdateSchema)),
		asyncHandler(SubclinicalTypeController.update)
	)
	.delete(asyncHandler(SubclinicalTypeController.delete))
	.get(asyncHandler(SubclinicalTypeController.getById));

export default route;