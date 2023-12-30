import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { DoctorsInforController } from "@/controllers";
import { DoctorsInforCreateSchema, DoctorsInforUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(DoctorsInforCreateSchema)),
		asyncHandler(DoctorsInforController.create)
	)
	.get(asyncHandler(DoctorsInforController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(DoctorsInforUpdateSchema)),
		asyncHandler(DoctorsInforController.update)
	)
	.delete(asyncHandler(DoctorsInforController.delete))
	.get(asyncHandler(DoctorsInforController.getById));

export default route;