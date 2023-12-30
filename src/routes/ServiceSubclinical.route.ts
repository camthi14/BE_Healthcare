import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ServiceSubclinicalController } from "@/controllers";
import { ServiceSubclinicalCreateSchema, ServiceSubclinicalUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ServiceSubclinicalCreateSchema)),
		asyncHandler(ServiceSubclinicalController.create)
	)
	.get(asyncHandler(ServiceSubclinicalController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ServiceSubclinicalUpdateSchema)),
		asyncHandler(ServiceSubclinicalController.update)
	)
	.delete(asyncHandler(ServiceSubclinicalController.delete))
	.get(asyncHandler(ServiceSubclinicalController.getById));

export default route;