import { Model } from "@/lib";

export interface ResultsImage {
  id?: string;
  result_id: string;
  url: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

class ResultsImageModel extends Model {
  protected table: string = "ResultsImages";

  protected fillables: string[] = ["id", "result_id", "url", "deleted_at"];

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

export default new ResultsImageModel();
