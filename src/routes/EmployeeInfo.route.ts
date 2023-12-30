import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { EmployeeInfoController } from "@/controllers";
import { EmployeeInfoCreateSchema, EmployeeInfoUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(EmployeeInfoCreateSchema)),
		asyncHandler(EmployeeInfoController.create)
	)
	.get(asyncHandler(EmployeeInfoController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(EmployeeInfoUpdateSchema)),
		asyncHandler(EmployeeInfoController.update)
	)
	.delete(asyncHandler(EmployeeInfoController.delete))
	.get(asyncHandler(EmployeeInfoController.getById));

export default route;