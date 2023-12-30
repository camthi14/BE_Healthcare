import { Model } from "@/lib";

export interface Subclinical {
  id?: number;
  subclinical_type_id: number;
  price: number;
  content: string;
  name: string;
  room_id: number;
  desc: string;
  status?: "active" | "inactive" | "banned";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class SubclinicalModel extends Model {
  protected table: string = "Subclinicals";

  protected fillables: string[] = [
    "id",
    "price",
    "content",
    "name",
    "room_id",
    "desc",
    "subclinical_type_id",
    "status",
    "deleted_at",
  ];

  protected timestamps: boolean = true;

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

export default new SubclinicalModel();
