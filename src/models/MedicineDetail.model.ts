import { Model } from "@/lib";

export interface MedicineDetail {
  medicine_id: string;
  quantity: number;
  price: number;
  production_date: string;
  drug_concentration: number;
  price_sell: number;
  ingredients: string;
  expired_at: string;
  status?: "active" | "inactive" | "banned" | "waiting" | "reject";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class MedicineDetailModel extends Model {
  protected table: string = "MedicineDetails";

  protected fillables: string[] = [
    "medicine_id",
    "quantity",
    "price",
    "price_sell",
    "ingredients",
    "production_date",
    "drug_concentration",
    "expired_at",
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

export default new MedicineDetailModel();
