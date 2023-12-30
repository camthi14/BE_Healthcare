import { Model } from "@/lib";

export interface Notification {
  id?: number;
  actor_type: "patient" | "owner" | "doctor" | "employee";
  user_id: string;
  title: string;
  body: string;
  notification_type?: string;
  entity_name: string;
  entity_id: string;
  is_system: boolean | 0 | 1;
  is_read?: boolean | 0 | 1;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class NotificationModel extends Model {
  protected table: string = "Notifications";

  protected fillables: string[] = [
    "id",
    "actor_type",
    "user_id",
    "title",
    "body",
    "notification_type",
    "is_system",
    "is_read",
    "entity_name",
    "entity_id",
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

export default new NotificationModel();
