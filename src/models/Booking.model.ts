import { Model } from "@/lib";

export type BookingStatus =
  | "in_progress"
  | "waiting"
  | "completed"
  | "paid"
  | "canceled"
  | "doctor_canceled"
  | "waiting"
  | "examinate";

export interface Booking {
  id?: string;
  patient_id: string;
  doctor_id: string;
  hour_id: string;
  date: string;
  note?: string;
  reason: string;
  price?: number;
  actor_booking_type?: string;
  actor_booking_value?: string;
  type_patient: "new" | "re_examination";
  status?: BookingStatus;
  order?: number;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class BookingModel extends Model {
  protected table: string = "Bookings";

  protected fillables: string[] = [
    "id",
    "patient_id",
    "doctor_id",
    "hour_id",
    "date",
    "note",
    "reason",
    "price",
    "actor_booking_type",
    "actor_booking_value",
    "type_patient",
    "status",
    "order",
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

  async getPatients({
    doctorId,
    limit,
    page,
    status,
  }: {
    doctorId: string;
    status: BookingStatus;
    limit: number;
    page: number;
  }) {
    const offset = (page - 1) * limit;

    const response: { patient_id: string; created_at: string }[] = await this.callProd(
      "sp_get_patient_last_time",
      [doctorId, status, limit, offset]
    );

    return response;
  }
}

export default new BookingModel();
