import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { SubclinicalController } from "@/controllers";
import { SubclinicalCreateSchema, SubclinicalUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(SubclinicalCreateSchema)),
		asyncHandler(SubclinicalController.create)
	)
	.get(asyncHandler(SubclinicalController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(SubclinicalUpdateSchema)),
		asyncHandler(SubclinicalController.update)
	)
	.delete(asyncHandler(SubclinicalController.delete))
	.get(asyncHandler(SubclinicalController.getById));

export default route;