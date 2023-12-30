import { Model } from "@/lib";

export type ExaminationCardsDetailStatus = "required" | "finished" | "unfinished";

export interface ExaminationCardsDetail {
  id?: string;
  examination_card_id: string;
  service_entity: string;
  service_value: string;
  doctor_id?: string | null;
  status?: ExaminationCardsDetailStatus;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ExaminationCardsDetailModel extends Model {
  protected table: string = "ExaminationCardsDetails";

  protected fillables: string[] = [
    "id",
    "examination_card_id",
    "service_entity",
    "service_value",
    "doctor_id",
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

export default new ExaminationCardsDetailModel();
