import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RoomController } from "@/controllers";
import { RoomCreateSchema, RoomUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RoomCreateSchema)),
		asyncHandler(RoomController.create)
	)
	.get(asyncHandler(RoomController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RoomUpdateSchema)),
		asyncHandler(RoomController.update)
	)
	.delete(asyncHandler(RoomController.delete))
	.get(asyncHandler(RoomController.getById));

export default route;