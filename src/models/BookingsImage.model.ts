import { Model } from "@/lib";

export interface BookingsImage {
  id?: string;
  booking_id: string;
  url: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

class BookingsImageModel extends Model {
  protected table: string = "BookingsImages";

  protected fillables: string[] = ["id", "booking_id", "url", "deleted_at"];

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

export default new BookingsImageModel();
