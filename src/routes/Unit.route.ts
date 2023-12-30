import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { UnitController } from "@/controllers";
import { UnitCreateSchema, UnitUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(UnitCreateSchema)),
		asyncHandler(UnitController.create)
	)
	.get(asyncHandler(UnitController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(UnitUpdateSchema)),
		asyncHandler(UnitController.update)
	)
	.delete(asyncHandler(UnitController.delete))
	.get(asyncHandler(UnitController.getById));

export default route;