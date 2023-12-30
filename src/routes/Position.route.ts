import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PositionController } from "@/controllers";
import { PositionCreateSchema, PositionUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(PositionCreateSchema)),
		asyncHandler(PositionController.create)
	)
	.get(asyncHandler(PositionController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(PositionUpdateSchema)),
		asyncHandler(PositionController.update)
	)
	.delete(asyncHandler(PositionController.delete))
	.get(asyncHandler(PositionController.getById));

export default route;