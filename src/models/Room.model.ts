import { Model } from "@/lib";

export interface Room {
  id?: number;
  name: string;
  desc: string;
  equipment_id: number;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

class RoomModel extends Model {
  protected table: string = "Rooms";

  protected fillables: string[] = ["id", "name", "desc", "equipment_id", "deleted_at"];

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

export default new RoomModel();
