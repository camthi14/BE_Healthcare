import { object, string, TypeOf } from "zod";

export const HourObjectCreateSchema = object({
	body: object({
		schedule_doctor_id: string({
			required_error: "schedule_doctor_id là trường bắt buộc",
		}),
		time_start: string({
			required_error: "time_start là trường bắt buộc",
		}),
		time_end: string({
			required_error: "time_end là trường bắt buộc",
		}),
	}),
});

export const HourObjectUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		schedule_doctor_id: string({
			required_error: "schedule_doctor_id là trường bắt buộc",
		}),
		time_start: string({
			required_error: "time_start là trường bắt buộc",
		}),
		time_end: string({
			required_error: "time_end là trường bắt buộc",
		}),
	}),
});

export type HourObjectInputCreate = TypeOf<typeof HourObjectCreateSchema>["body"];

export type HourObjectInputUpdate = TypeOf<typeof HourObjectUpdateSchema>;
