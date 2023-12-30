import { Model } from "@/lib";

export interface Permission {
  id?: number;
  name: string;
  alias: string;
  desc: string;
  created_at?: string;
  updated_at?: string;
}

class PermissionModel extends Model {
  protected table: string = "Permissions";

  protected fillables: string[] = ["id", "name", "alias", "desc"];

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

export default new PermissionModel();
