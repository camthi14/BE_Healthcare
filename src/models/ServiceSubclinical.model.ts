import { Model } from "@/lib";

export interface ServiceSubclinical {
  service_id: number;
  subclinical_id: number;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

class ServiceSubclinicalModel extends Model {
  protected table: string = "ServiceSubclinicals";

  protected fillables: string[] = ["service_id", "subclinical_id", "deleted_at"];

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

export default new ServiceSubclinicalModel();
