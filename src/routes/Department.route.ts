import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { DepartmentController } from "@/controllers";
import { DepartmentCreateSchema, DepartmentUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(DepartmentCreateSchema)),
		asyncHandler(DepartmentController.create)
	)
	.get(asyncHandler(DepartmentController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(DepartmentUpdateSchema)),
		asyncHandler(DepartmentController.update)
	)
	.delete(asyncHandler(DepartmentController.delete))
	.get(asyncHandler(DepartmentController.getById));

export default route;