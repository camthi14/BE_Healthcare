import { Model } from "@/lib";

export interface MedicineType {
  id?: number;
  name: string;
  desc: string;
  status?: "active" | "inactive" | "banned" | "active" | "";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class MedicineTypeModel extends Model {
	protected table: string = "MedicineTypes";

	protected fillables: string[] = ["id","name","desc","status","deleted_at"];

	protected timestamps: boolean = false;

	get getFillables() {
		return this.fillables;
	}

	get getTable() {
		return this.table;
	}

	get getTimestamps() {
		return this.timestamps;
	}
}

export default new MedicineTypeModel();
