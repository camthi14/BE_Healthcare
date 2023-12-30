import { Model } from "@/lib";

export type ExaminationCardOptions =
  | "service"
  | "subclinical"
  | "doctor.service"
  | "doctor.subclinical"
  | "re_examination"
  | "doctor.re_examination";

export type ExaminationCardStatus =
  | "in_progress"
  | "complete"
  | "pending"
  | "reject"
  | "delay_results"
  | "examination";

export interface ExaminationCard {
  id?: string;
  order: number;
  booking_id: string;
  note: string;
  status?: ExaminationCardStatus;
  options: ExaminationCardOptions;
  artery?: number | null;
  temperature?: number | null;
  spO2?: number | null;
  breathing_rate?: number | null;
  blood_pressure?: number | null;
  under_blood_pressure?: number | null;
  is_use_service?: boolean;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ExaminationCardModel extends Model {
  protected table: string = "ExaminationCards";

  protected fillables: string[] = [
    "id",
    "order",
    "booking_id",
    "note",
    "artery",
    "temperature",
    "spO2",
    "under_blood_pressure",
    "breathing_rate",
    "options",
    "blood_pressure",
    "is_use_service",
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

export default new ExaminationCardModel();
