import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RolePermissionController } from "@/controllers";
import { RolePermissionCreateSchema, RolePermissionUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RolePermissionCreateSchema)),
		asyncHandler(RolePermissionController.create)
	)
	.get(asyncHandler(RolePermissionController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RolePermissionUpdateSchema)),
		asyncHandler(RolePermissionController.update)
	)
	.delete(asyncHandler(RolePermissionController.delete))
	.get(asyncHandler(RolePermissionController.getById));

export default route;