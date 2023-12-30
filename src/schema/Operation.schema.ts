import { object, string, TypeOf } from "zod";

export const OperationCreateSchema = object({
	body: object({
		department_id: string({
			required_error: "department_id là trường bắt buộc",
		}),
		position_id: string({
			required_error: "position_id là trường bắt buộc",
		}),
	}),
});

export const OperationUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		department_id: string({
			required_error: "department_id là trường bắt buộc",
		}),
		position_id: string({
			required_error: "position_id là trường bắt buộc",
		}),
	}),
});

export type OperationInputCreate = TypeOf<typeof OperationCreateSchema>["body"];

export type OperationInputUpdate = TypeOf<typeof OperationUpdateSchema>;
