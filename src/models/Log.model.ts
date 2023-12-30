import { Model } from "@/lib";

export interface Log {
  id?: number;
  filename: string;
  log_type: "errors" | "requests";
  created_at?: string;
  updated_at?: string;
}

class LogModel extends Model {
	protected table: string = "Logs";

	protected fillables: string[] = ["id","filename","log_type"];

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

export default new LogModel();
