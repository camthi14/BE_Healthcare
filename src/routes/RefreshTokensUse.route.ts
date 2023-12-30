import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RefreshTokensUseController } from "@/controllers";
import { RefreshTokensUseCreateSchema, RefreshTokensUseUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RefreshTokensUseCreateSchema)),
		asyncHandler(RefreshTokensUseController.create)
	)
	.get(asyncHandler(RefreshTokensUseController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RefreshTokensUseUpdateSchema)),
		asyncHandler(RefreshTokensUseController.update)
	)
	.delete(asyncHandler(RefreshTokensUseController.delete))
	.get(asyncHandler(RefreshTokensUseController.getById));

export default route;