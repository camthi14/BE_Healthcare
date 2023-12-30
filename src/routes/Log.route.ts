import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { LogController } from "@/controllers";
import { LogCreateSchema, LogUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(LogCreateSchema)),
		asyncHandler(LogController.create)
	)
	.get(asyncHandler(LogController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(LogUpdateSchema)),
		asyncHandler(LogController.update)
	)
	.delete(asyncHandler(LogController.delete))
	.get(asyncHandler(LogController.getById));

export default route;