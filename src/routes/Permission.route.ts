import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PermissionController } from "@/controllers";
import { PermissionCreateSchema, PermissionUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(PermissionCreateSchema)),
		asyncHandler(PermissionController.create)
	)
	.get(asyncHandler(PermissionController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(PermissionUpdateSchema)),
		asyncHandler(PermissionController.update)
	)
	.delete(asyncHandler(PermissionController.delete))
	.get(asyncHandler(PermissionController.getById));

export default route;