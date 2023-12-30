import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { SaveExpoPushTokenController } from "@/controllers";
import { SaveExpoPushTokenCreateSchema, SaveExpoPushTokenUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(SaveExpoPushTokenCreateSchema)),
		asyncHandler(SaveExpoPushTokenController.create)
	)
	.get(asyncHandler(SaveExpoPushTokenController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(SaveExpoPushTokenUpdateSchema)),
		asyncHandler(SaveExpoPushTokenController.update)
	)
	.delete(asyncHandler(SaveExpoPushTokenController.delete))
	.get(asyncHandler(SaveExpoPushTokenController.getById));

export default route;