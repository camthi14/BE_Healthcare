import { Model } from "@/lib";

export interface PatientType {
  id?: number;
  name: string;
  desc: string;
  is_default?: 0 | 1 | boolean;
  created_at?: string;
  updated_at?: string;
}

class PatientTypeModel extends Model {
  protected table: string = "PatientTypes";

  protected fillables: string[] = ["id", "name", "desc"];

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

export default new PatientTypeModel();
