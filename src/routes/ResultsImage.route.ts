import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ResultsImageController } from "@/controllers";
import { ResultsImageCreateSchema, ResultsImageUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ResultsImageCreateSchema)),
		asyncHandler(ResultsImageController.create)
	)
	.get(asyncHandler(ResultsImageController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ResultsImageUpdateSchema)),
		asyncHandler(ResultsImageController.update)
	)
	.delete(asyncHandler(ResultsImageController.delete))
	.get(asyncHandler(ResultsImageController.getById));

export default route;