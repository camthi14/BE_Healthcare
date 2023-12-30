import { Model } from "@/lib";

export interface TokenPair {
  id?: number;
  patient_id?: string;
  employee_id?: string;
  owner_id?: number;
  doctor_id?: string;
  public_key: string;
  private_key: string;
  refresh_token: string;
  created_at?: string;
  updated_at?: string;
}

class TokenPairModel extends Model {
  protected table: string = "TokenPairs";

  protected fillables: string[] = [
    "id",
    "patient_id",
    "employee_id",
    "owner_id",
    "doctor_id",
    "public_key",
    "private_key",
    "refresh_token",
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

export default new TokenPairModel();
