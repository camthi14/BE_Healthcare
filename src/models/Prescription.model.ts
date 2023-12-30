import { Model } from "@/lib";

export interface Prescription {
  id?: string;
  exam_card_id: string;
  employee_id?: string;
  doctor_id: string;
  diagnosis?: string;
  note?: string;

  quantity_re_exam?: number;
  date_re_exam?: string;

  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class PrescriptionModel extends Model {
  protected table: string = "Prescriptions";

  protected fillables: string[] = [
    "id",
    "exam_card_id",
    "employee_id",
    "doctor_id",
    "diagnosis",
    "note",
    "quantity_re_exam",
    "date_re_exam",
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

export default new PrescriptionModel();
