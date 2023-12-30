import { Model } from "@/lib";
import { ResultsImage } from "./ResultsImage.model";

export interface ResultsDiagnosisSubclinical {
  id?: string;
  exam_card_details_id: string;
  subclinical_id: number;
  rate: string;
  results: string;

  images?: ResultsImage[];

  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

class ResultsDiagnosisSubclinicalModel extends Model {
  protected table: string = "ResultsDiagnosisSubclinicals";

  protected fillables: string[] = [
    "id",
    "exam_card_details_id",
    "subclinical_id",
    "rate",
    "results",
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

export default new ResultsDiagnosisSubclinicalModel();
