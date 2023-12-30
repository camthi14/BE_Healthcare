import { object, string, TypeOf } from "zod";

export const EmployeeInfoCreateSchema = object({
	body: object({
		employee_id: string({
			required_error: "employee_id là trường bắt buộc",
		}),
		first_name: string({
			required_error: "first_name là trường bắt buộc",
		}),
		last_name: string({
			required_error: "last_name là trường bắt buộc",
		}),
	}),
});

export const EmployeeInfoUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		employee_id: string({
			required_error: "employee_id là trường bắt buộc",
		}),
		first_name: string({
			required_error: "first_name là trường bắt buộc",
		}),
		last_name: string({
			required_error: "last_name là trường bắt buộc",
		}),
	}),
});

export type EmployeeInfoInputCreate = TypeOf<typeof EmployeeInfoCreateSchema>["body"];

export type EmployeeInfoInputUpdate = TypeOf<typeof EmployeeInfoUpdateSchema>;
