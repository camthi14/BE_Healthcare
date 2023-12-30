import { addLog, findLogByFilename } from "@/repositories";
import { childFolderLog } from "@/utils";
import { env } from "config";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
import { LogEventParams } from "types";

const RootLog = env.FOLDER_ROOT_LOG;

async function logEvents({ message, type }: LogEventParams) {
  const folder = childFolderLog(type, RootLog);

  const format = dayjs().format("DD-MM-YYYY");
  const datetime = `[${dayjs().format("HH:mm:ss")}]`;

  const filename = path.join(folder, `${format}.log`);
  const contentLog = `${datetime} ${message}`;

  if (!(await findLogByFilename(format, type))) {
    await addLog(format, type);
  }

  await fs.promises.appendFile(filename, contentLog, { encoding: "utf-8" });
}

export default logEvents;
