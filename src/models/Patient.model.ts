import { Model } from "@/lib";

export type RelationshipType = "me" | "mother" | "father" | "others" | "married_couple";

export interface Patient {
  id?: string;
  patient_type_id: number;
  display_name: string;
  password: string;
  email: string;
  email_verified_at?: string;
  phone_number: string;
  phone_verified_at?: string;
  remember_token?: string;
  photo?: string;
  status?: "active" | "inactive" | "waitting";

  relatives_id?: string | null;
  relationship?: RelationshipType;

  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
  email_verify_token?: string | null;
  otp_token?: string | null;
}

class PatientModel extends Model {
  protected table: string = "Patients";

  protected fillables: string[] = [
    "id",
    "patient_type_id",
    "display_name",
    "password",
    "email",
    "email_verified_at",
    "phone_number",
    "phone_verified_at",
    "remember_token",
    "photo",
    "relatives_id",
    "relationship",
    "status",
    "deleted_at",
    "email_verify_token",
    "otp_token",
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

export default new PatientModel();
