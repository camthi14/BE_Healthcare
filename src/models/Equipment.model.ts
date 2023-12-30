import { Model } from "@/lib";

export interface Equipment {
  id?: number;
  equipment_type_id: number;
  photo?: string | null;
  name: string;
  desc: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class EquipmentModel extends Model {
  protected table: string = "Equipments";

  protected fillables: string[] = [
    "id",
    "equipment_type_id",
    "name",
    "desc",
    "photo",
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

export default new EquipmentModel();
