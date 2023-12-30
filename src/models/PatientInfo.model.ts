import { Model } from "@/lib";

export interface PatientInfo {
  id?: number;
  patient_id: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  address?: string;
  desc?: string;
  gender?: "MALE" | "FEMALE" | "MALE" | "";
  created_at?: string;
  updated_at?: string;
}

class PatientInfoModel extends Model {
	protected table: string = "PatientInfos";

	protected fillables: string[] = ["id","patient_id","first_name","last_name","birth_date","address","desc","gender"];

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

export default new PatientInfoModel();
