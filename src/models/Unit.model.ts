import { Model } from "@/lib";

export interface Unit {
  id?: number;
  name: string;
  desc: string;
  character: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

class UnitModel extends Model {
	protected table: string = "Units";

	protected fillables: string[] = ["id","name","desc","character","deleted_at"];

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

export default new UnitModel();
