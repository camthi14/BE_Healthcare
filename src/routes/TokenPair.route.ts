import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { TokenPairController } from "@/controllers";
import { TokenPairCreateSchema, TokenPairUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(TokenPairCreateSchema)),
		asyncHandler(TokenPairController.create)
	)
	.get(asyncHandler(TokenPairController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(TokenPairUpdateSchema)),
		asyncHandler(TokenPairController.update)
	)
	.delete(asyncHandler(TokenPairController.delete))
	.get(asyncHandler(TokenPairController.getById));

export default route;