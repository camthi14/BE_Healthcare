import { Model } from "@/lib";

export interface SaveExpoPushToken {
  id?: number;
  expo_push_token?: string;
  user_id?: string;
  actor_type?: "patient" | "owner" | "doctor" | "employee" | "patient" | "";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class SaveExpoPushTokenModel extends Model {
  protected table: string = "SaveExpoPushTokens";

  protected fillables: string[] = ["id", "expo_push_token", "user_id", "actor_type", "deleted_at"];

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

export default new SaveExpoPushTokenModel();
