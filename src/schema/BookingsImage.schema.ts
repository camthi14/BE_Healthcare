import { object, string, TypeOf } from "zod";

export const BookingsImageCreateSchema = object({
	body: object({
		booking_id: string({
			required_error: "booking_id là trường bắt buộc",
		}),
		url: string({
			required_error: "url là trường bắt buộc",
		}),
	}),
});

export const BookingsImageUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		booking_id: string({
			required_error: "booking_id là trường bắt buộc",
		}),
		url: string({
			required_error: "url là trường bắt buộc",
		}),
	}),
});

export type BookingsImageInputCreate = TypeOf<typeof BookingsImageCreateSchema>["body"];

export type BookingsImageInputUpdate = TypeOf<typeof BookingsImageUpdateSchema>;
