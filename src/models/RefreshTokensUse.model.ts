import { Model } from "@/lib";

export interface RefreshTokensUse {
  id?: number;
  key_id: number;
  refresh_token: string;
  created_at?: string;
  updated_at?: string;
}

class RefreshTokensUseModel extends Model {
  protected table: string = "RefreshTokensUsed";

  protected fillables: string[] = ["id", "key_id", "refresh_token"];

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

export default new RefreshTokensUseModel();
