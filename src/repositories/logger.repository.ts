import { Log, LogModel } from "@/models";
import { FolderLog } from "types";

export const findLogByFilename = async (filename: string, type: FolderLog) => {
  try {
    return await LogModel.findOne<Log>({ filename, log_type: type });
  } catch (error) {
    console.log(`Error findLogByFilename`, error);
  }
};

export const addLog = async (filename: string, type: FolderLog) => {
  try {
    return await LogModel.create({ filename, log_type: type });
  } catch (error) {
    console.log(`Error addLog`, error);
  }
};
