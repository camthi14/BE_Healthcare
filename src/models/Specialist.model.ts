import { Model } from "@/lib";

export interface Specialist {
  id?: number;
  name: string;
  desc: string;
  photo?: string | null;
  time_chekup_avg: number;
  price: number;
  status?: "active" | "inactive" | "banned" | "waitting" | "reject";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class SpecialistModel extends Model {
  protected table: string = "Specialists";

  protected fillables: string[] = [
    "id",
    "name",
    "desc",
    "photo",
    "time_chekup_avg",
    "price",
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

export default new SpecialistModel();
