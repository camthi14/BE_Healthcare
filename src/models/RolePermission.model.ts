import { Model } from "@/lib";

export interface RolePermission {
  permission_id: number;
  role_id: number;
  created_at?: string;
  updated_at?: string;
}

class RolePermissionModel extends Model {
	protected table: string = "RolePermissions";

	protected fillables: string[] = ["permission_id","role_id"];

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

export default new RolePermissionModel();
