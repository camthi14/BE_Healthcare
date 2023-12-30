import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { EquipmentTypeController } from "@/controllers";
import { EquipmentTypeCreateSchema, EquipmentTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(EquipmentTypeCreateSchema)),
		asyncHandler(EquipmentTypeController.create)
	)
	.get(asyncHandler(EquipmentTypeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(EquipmentTypeUpdateSchema)),
		asyncHandler(EquipmentTypeController.update)
	)
	.delete(asyncHandler(EquipmentTypeController.delete))
	.get(asyncHandler(EquipmentTypeController.getById));

export default route;