import { Model } from "@/lib";

export interface PrescriptionsDetail {
  id?: string;
  prescriptions_id: string;
  medicine_id?: string;
  quantity_ordered?: number;
  note?: string;
  amount_use_in_day?: "1" | "2" | "3";
  amount_of_medication_per_session?: number;
  session?: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class PrescriptionsDetailModel extends Model {
  protected table: string = "PrescriptionsDetails";

  protected fillables: string[] = [
    "id",
    "prescriptions_id",
    "medicine_id",
    "quantity_ordered",
    "note",
    "amount_use_in_day",
    "amount_of_medication_per_session",
    "session",
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

export default new PrescriptionsDetailModel();
