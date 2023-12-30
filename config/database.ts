import { accessRunSQL } from "@/constants";
import { MySQL } from "@/database";
import {
  handleCreateRouteWithIndex,
  processSQLFile,
  runCreates,
} from "@/helpers/runCommandSql.helper";
import { customLog, customLogError, rootFolderLog } from "@/utils/common.util";
import path from "path";
import fs from "fs";

const executeSql = async (arraySQL: Array<string>) => {
  const mysql2 = new MySQL(accessRunSQL);
  const conn = await mysql2.connection.getConnection();

  const rootFolderModel = rootFolderLog("models");
  const rootFolderSchema = rootFolderLog("schema");
  const rootFolderService = rootFolderLog("services");
  const rootFolderController = rootFolderLog("controllers");
  const rootFolderRoute = rootFolderLog("routes");
  const fileRouteIndex = path.join(rootFolderRoute + "/route.ts");

  let contentIndexRoute = "";

  try {
    contentIndexRoute = (await fs.promises.readFile(fileRouteIndex)).toString();
  } catch (error) {
    contentIndexRoute = "";
  }

  let tableCreatedRoute: string[] = [];

  try {
    customLog("Yellow", `Start transaction...`);

    await conn.beginTransaction();

    const transactions = arraySQL.map(async (value, index) => {
      try {
        await conn.execute(value);

        if (value.toLowerCase().startsWith("create table")) {
          const tableCreated = await runCreates(
            value,
            rootFolderModel,
            rootFolderSchema,
            rootFolderService,
            rootFolderController,
            rootFolderRoute
          );

          if (tableCreated) {
            tableCreatedRoute.push(tableCreated);
          }
        }
      } catch (error) {
        customLog("Default", "Transaction rollback with error...");
        customLogError(error);
        await conn.rollback();
      } finally {
        customLog("Blue", `Finally Transaction ${index} ...`);
      }
    });

    await Promise.all(transactions);

    await conn.commit();
    conn.release();
    mysql2.connection.releaseConnection(conn);
    customLog("Blue", `Transaction commit success...`);

    if (!tableCreatedRoute.length) process.exit(0);

    if (!fs.existsSync(fileRouteIndex)) {
      contentIndexRoute += `import { Router } from "express";\n\n`;
      contentIndexRoute += `const router = Router();\n\n`;
      contentIndexRoute += `export default router;`;
    }

    contentIndexRoute = handleCreateRouteWithIndex(tableCreatedRoute, contentIndexRoute);

    await fs.promises.writeFile(fileRouteIndex, contentIndexRoute, { encoding: "utf-8" });
  } catch (error) {
    customLog("Default", "Transaction exit with error...");
    customLogError(error);
    conn.release();
    process.exit(1);
  }

  customLog("Yellow", "End transaction...");

  process.exit(0);
};

const main = async () => {
  const databaseName = process.env.npm_config_database ?? "";

  if (!databaseName) {
    customLogError(`Missing argument --database=yourFileNameSql`);
    process.exit(1);
  }

  const pathRoot = path.join(__dirname + `/../${databaseName}.sql`);

  if (!fs.existsSync(pathRoot)) {
    customLogError(`File sql \`${databaseName}.sql\` not found!. Please Enter correct.`);
    process.exit(1);
  }

  const arraySQL = processSQLFile(pathRoot);

  return await executeSql(arraySQL);
};

(async () => await main())();
