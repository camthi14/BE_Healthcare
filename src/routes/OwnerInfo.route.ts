import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { OwnerInfoController } from "@/controllers";
import { OwnerInfoCreateSchema, OwnerInfoUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(OwnerInfoCreateSchema)),
		asyncHandler(OwnerInfoController.create)
	)
	.get(asyncHandler(OwnerInfoController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(OwnerInfoUpdateSchema)),
		asyncHandler(OwnerInfoController.update)
	)
	.delete(asyncHandler(OwnerInfoController.delete))
	.get(asyncHandler(OwnerInfoController.getById));

export default route;