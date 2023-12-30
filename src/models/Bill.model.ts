import { Model } from "@/lib";

export type BillStatus = "paid" | "unpaid" | "partially_paid" | "others";

export interface Bill {
  id?: string;
  employee_id?: string | null;
  booking_id?: string | null;
  examination_card_id: string;
  total_price: number;
  payment_for: "medicine" | "cost_exam" | "cost_cls";
  deposit?: number;
  change?: number;
  price_received?: number;
  note?: string;
  status: BillStatus;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class BillModel extends Model {
  protected table: string = "Bills";

  protected fillables: string[] = [
    "id",
    "employee_id",
    "booking_id",
    "examination_card_id",
    "total_price",
    "payment_for",
    "deposit",
    "change",
    "price_received",
    "note",
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

export default new BillModel();
