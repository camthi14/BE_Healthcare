import { object, string, TypeOf } from "zod";

export const MedicineDetailCreateSchema = object({
	body: object({
		medicine_id: string({
			required_error: "medicine_id là trường bắt buộc",
		}),
		quantity: string({
			required_error: "quantity là trường bắt buộc",
		}),
		price: string({
			required_error: "price là trường bắt buộc",
		}),
		production_date: string({
			required_error: "production_date là trường bắt buộc",
		}),
		drug_concentration: string({
			required_error: "drug_concentration là trường bắt buộc",
		}),
		expired_at: string({
			required_error: "expired_at là trường bắt buộc",
		}),
	}),
});

export const MedicineDetailUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		medicine_id: string({
			required_error: "medicine_id là trường bắt buộc",
		}),
		quantity: string({
			required_error: "quantity là trường bắt buộc",
		}),
		price: string({
			required_error: "price là trường bắt buộc",
		}),
		production_date: string({
			required_error: "production_date là trường bắt buộc",
		}),
		drug_concentration: string({
			required_error: "drug_concentration là trường bắt buộc",
		}),
		expired_at: string({
			required_error: "expired_at là trường bắt buộc",
		}),
	}),
});

export type MedicineDetailInputCreate = TypeOf<typeof MedicineDetailCreateSchema>["body"];

export type MedicineDetailInputUpdate = TypeOf<typeof MedicineDetailUpdateSchema>;
