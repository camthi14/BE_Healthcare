import { Model } from "@/lib";

export interface Service {
  id?: number;
  service_type_id: number;
  photo?: string | null;
  price: number;
  content: string;
  name: string;
  desc: string;
  status?: "active" | "inactive" | "banned";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ServiceModel extends Model {
  protected table: string = "Services";

  protected fillables: string[] = [
    "id",
    "service_type_id",
    "name",
    "desc",
    "status",
    "deleted_at",
    "photo",
    "price",
    "content",
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

export default new ServiceModel();
