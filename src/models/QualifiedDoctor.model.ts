import { Model } from "@/lib";

export interface QualifiedDoctor {
  id?: number;
  name: string;
  status?: "active" | "inactive" | "banned";
  character: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class QualifiedDoctorModel extends Model {
  protected table: string = "QualifiedDoctors";

  protected fillables: string[] = ["id", "name", "character", "status", "deleted_at"];

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

export default new QualifiedDoctorModel();
