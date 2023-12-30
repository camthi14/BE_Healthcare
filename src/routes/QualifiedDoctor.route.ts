import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { QualifiedDoctorController } from "@/controllers";
import { QualifiedDoctorCreateSchema, QualifiedDoctorUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(QualifiedDoctorCreateSchema)),
		asyncHandler(QualifiedDoctorController.create)
	)
	.get(asyncHandler(QualifiedDoctorController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(QualifiedDoctorUpdateSchema)),
		asyncHandler(QualifiedDoctorController.update)
	)
	.delete(asyncHandler(QualifiedDoctorController.delete))
	.get(asyncHandler(QualifiedDoctorController.getById));

export default route;