export type FolderLog = "errors" | "requests";

export interface LogEventParams {
  type: FolderLog;
  message: string;
}

export type TypeLogs =
  | "Default"
  | "Danger"
  | "Success"
  | "Yellow"
  | "Orange"
  | "BrightMagenta"
  | "Cyan"
  | "Blue";
