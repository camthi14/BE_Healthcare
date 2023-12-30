import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { HourObjectController } from "@/controllers";
import { HourObjectCreateSchema, HourObjectUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(HourObjectCreateSchema)),
		asyncHandler(HourObjectController.create)
	)
	.get(asyncHandler(HourObjectController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(HourObjectUpdateSchema)),
		asyncHandler(HourObjectController.update)
	)
	.delete(asyncHandler(HourObjectController.delete))
	.get(asyncHandler(HourObjectController.getById));

export default route;