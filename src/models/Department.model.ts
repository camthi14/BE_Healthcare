import { Model } from "@/lib";

export interface Department {
  id?: number;
  name: string;
  desc: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class DepartmentModel extends Model {
	protected table: string = "Departments";

	protected fillables: string[] = ["id","name","desc","deleted_at"];

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

export default new DepartmentModel();
