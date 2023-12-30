import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { SessionsCheckupController } from "@/controllers";
import { SessionsCheckupCreateSchema, SessionsCheckupUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(SessionsCheckupCreateSchema)),
		asyncHandler(SessionsCheckupController.create)
	)
	.get(asyncHandler(SessionsCheckupController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(SessionsCheckupUpdateSchema)),
		asyncHandler(SessionsCheckupController.update)
	)
	.delete(asyncHandler(SessionsCheckupController.delete))
	.get(asyncHandler(SessionsCheckupController.getById));

export default route;