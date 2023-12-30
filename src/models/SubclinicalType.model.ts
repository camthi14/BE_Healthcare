import { Model } from "@/lib";

export interface SubclinicalType {
  id?: number;
  name: string;
  status?: "active" | "inactive" | "banned";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class SubclinicalTypeModel extends Model {
  protected table: string = "SubclinicalTypes";

  protected fillables: string[] = ["id", "name", "status", "deleted_at"];

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

export default new SubclinicalTypeModel();
