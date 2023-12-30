import { Model } from "@/lib";

export interface Position {
  id?: number;
  name: string;
  desc: string;
  sub_num?: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class PositionModel extends Model {
  protected table: string = "Positions";

  protected fillables: string[] = ["id", "name", "desc", "sub_num", "deleted_at"];

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

export default new PositionModel();
