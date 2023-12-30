import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { BillController } from "@/controllers";
import { BillCreateSchema, BillUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(BillCreateSchema)),
		asyncHandler(BillController.create)
	)
	.get(asyncHandler(BillController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(BillUpdateSchema)),
		asyncHandler(BillController.update)
	)
	.delete(asyncHandler(BillController.delete))
	.get(asyncHandler(BillController.getById));

export default route;