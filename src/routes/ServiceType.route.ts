import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ServiceTypeController } from "@/controllers";
import { ServiceTypeCreateSchema, ServiceTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ServiceTypeCreateSchema)),
		asyncHandler(ServiceTypeController.create)
	)
	.get(asyncHandler(ServiceTypeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ServiceTypeUpdateSchema)),
		asyncHandler(ServiceTypeController.update)
	)
	.delete(asyncHandler(ServiceTypeController.delete))
	.get(asyncHandler(ServiceTypeController.getById));

export default route;