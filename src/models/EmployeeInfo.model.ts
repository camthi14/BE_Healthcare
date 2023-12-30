import { Model } from "@/lib";

export interface EmployeeInfo {
  id?: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  address?: string;
  desc?: string;
  gender?: "MALE" | "FEMALE";
  created_at?: string;
  updated_at?: string;
}

class EmployeeInfoModel extends Model {
  protected table: string = "EmployeeInfos";

  protected fillables: string[] = [
    "id",
    "employee_id",
    "first_name",
    "last_name",
    "birth_date",
    "address",
    "desc",
    "gender",
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

export default new EmployeeInfoModel();
