import { Model } from "@/lib";

export interface Operation {
  id?: number;
  employee_id?: string;
  doctor_id?: string;
  department_id: number;
  position_id: number;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

class OperationModel extends Model {
	protected table: string = "Operations";

	protected fillables: string[] = ["id","employee_id","doctor_id","department_id","position_id","deleted_at"];

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

export default new OperationModel();
