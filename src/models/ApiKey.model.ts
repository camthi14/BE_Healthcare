import { Model } from "@/lib";

export interface ApiKey {
  id?: number;
  patient_id?: string;
  employee_id?: string;
  owner_id?: number;
  doctor_id?: string;
  key: string;
  permissions?: "0000" | "1111" | "2222" | "3333";
  ip_address: string;
  status?: "active" | "inactive" | "banned";
  created_at?: string;
  updated_at?: string;
}

class ApiKeyModel extends Model {
  protected table: string = "ApiKeys";

  protected fillables: string[] = [
    "id",
    "patient_id",
    "employee_id",
    "owner_id",
    "doctor_id",
    "key",
    "permissions",
    "ip_address",
    "status",
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

export default new ApiKeyModel();
