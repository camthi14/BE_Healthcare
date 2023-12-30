import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { NotificationController } from "@/controllers";
import { NotificationCreateSchema, NotificationUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(NotificationCreateSchema)),
		asyncHandler(NotificationController.create)
	)
	.get(asyncHandler(NotificationController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(NotificationUpdateSchema)),
		asyncHandler(NotificationController.update)
	)
	.delete(asyncHandler(NotificationController.delete))
	.get(asyncHandler(NotificationController.getById));

export default route;