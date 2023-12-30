import { Model } from "@/lib";

export interface HourObject {
  id?: string;
  schedule_doctor_id?: string;
  time_start: string;
  time_end: string;
  is_remove: 0 | 1 | boolean;
  is_booked: 0 | 1 | boolean;
  is_cancel: 0 | 1 | boolean;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;

  is_over_time?: boolean;
}

class HourObjectModel extends Model {
  protected table: string = "HourObjects";

  protected fillables: string[] = [
    "id",
    "schedule_doctor_id",
    "time_start",
    "time_end",
    "is_remove",
    "is_booked",
    "is_cancel",
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

export default new HourObjectModel();
