import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RoleController } from "@/controllers";
import { RoleCreateSchema, RoleUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RoleCreateSchema)),
		asyncHandler(RoleController.create)
	)
	.get(asyncHandler(RoleController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RoleUpdateSchema)),
		asyncHandler(RoleController.update)
	)
	.delete(asyncHandler(RoleController.delete))
	.get(asyncHandler(RoleController.getById));

export default route;