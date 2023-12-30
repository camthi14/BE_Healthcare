import { Model } from "@/lib";

export interface SessionsCheckup {
  id?: number;
  name: string;
  desc?: string;
  time_start: string;
  time_end: string;
  status?: "active" | "inactive" | "active" | "";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class SessionsCheckupModel extends Model {
  protected table: string = "SessionsCheckups";

  protected fillables: string[] = [
    "id",
    "name",
    "time_start",
    "time_end",
    "desc",
    "status",
    "deleted_at",
  ];

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

export default new SessionsCheckupModel();
