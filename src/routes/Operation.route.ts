import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { OperationController } from "@/controllers";
import { OperationCreateSchema, OperationUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(OperationCreateSchema)),
		asyncHandler(OperationController.create)
	)
	.get(asyncHandler(OperationController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(OperationUpdateSchema)),
		asyncHandler(OperationController.update)
	)
	.delete(asyncHandler(OperationController.delete))
	.get(asyncHandler(OperationController.getById));

export default route;