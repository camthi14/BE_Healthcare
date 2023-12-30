import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PrescriptionsDetailController } from "@/controllers";
import { PrescriptionsDetailCreateSchema, PrescriptionsDetailUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(PrescriptionsDetailCreateSchema)),
		asyncHandler(PrescriptionsDetailController.create)
	)
	.get(asyncHandler(PrescriptionsDetailController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(PrescriptionsDetailUpdateSchema)),
		asyncHandler(PrescriptionsDetailController.update)
	)
	.delete(asyncHandler(PrescriptionsDetailController.delete))
	.get(asyncHandler(PrescriptionsDetailController.getById));

export default route;