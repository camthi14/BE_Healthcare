import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { BookingsImageController } from "@/controllers";
import { BookingsImageCreateSchema, BookingsImageUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(BookingsImageCreateSchema)),
		asyncHandler(BookingsImageController.create)
	)
	.get(asyncHandler(BookingsImageController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(BookingsImageUpdateSchema)),
		asyncHandler(BookingsImageController.update)
	)
	.delete(asyncHandler(BookingsImageController.delete))
	.get(asyncHandler(BookingsImageController.getById));

export default route;