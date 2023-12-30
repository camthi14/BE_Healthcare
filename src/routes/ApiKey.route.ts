import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ApiKeyController } from "@/controllers";
import { ApiKeyCreateSchema, ApiKeyUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ApiKeyCreateSchema)),
		asyncHandler(ApiKeyController.create)
	)
	.get(asyncHandler(ApiKeyController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ApiKeyUpdateSchema)),
		asyncHandler(ApiKeyController.update)
	)
	.delete(asyncHandler(ApiKeyController.delete))
	.get(asyncHandler(ApiKeyController.getById));

export default route;