import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PatientInfoController } from "@/controllers";
import { PatientInfoCreateSchema, PatientInfoUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(PatientInfoCreateSchema)),
		asyncHandler(PatientInfoController.create)
	)
	.get(asyncHandler(PatientInfoController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(PatientInfoUpdateSchema)),
		asyncHandler(PatientInfoController.update)
	)
	.delete(asyncHandler(PatientInfoController.delete))
	.get(asyncHandler(PatientInfoController.getById));

export default route;