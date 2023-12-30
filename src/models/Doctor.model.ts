import { Model } from "@/lib";

export interface Doctor {
  id?: string;
  qualified_doctor_id: number;
  speciality_id: number;
  display_name: string;
  username: string;
  password: string;
  email?: string;
  email_verified_at?: string;
  phone_number?: string;
  phone_verified_at?: string;
  remember_token?: string | null;
  photo?: string | null;
  status?: "active" | "inactive" | "banned" | "retired" | "inactive" | "";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class DoctorModel extends Model {
  protected table: string = "Doctors";

  protected fillables: string[] = [
    "id",
    "qualified_doctor_id",
    "speciality_id",
    "display_name",
    "username",
    "password",
    "email",
    "email_verified_at",
    "phone_number",
    "phone_verified_at",
    "remember_token",
    "photo",
    "status",
    "deleted_at",
  ];

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

export default new DoctorModel();
