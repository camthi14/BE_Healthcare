import { Model } from "@/lib";

export interface Medicine {
  id?: string;
  medictine_type_id: number;
  unit_id: number;
  name: string;
  status?: "active" | "inactive" | "banned" | "waiting";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class MedicineModel extends Model {
  protected table: string = "Medicines";

  protected fillables: string[] = [
    "id",
    "medictine_type_id",
    "unit_id",
    "name",
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

export default new MedicineModel();
