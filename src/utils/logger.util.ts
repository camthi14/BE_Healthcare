import { logEvents } from "@/helpers";
import dayjs from "dayjs";

const logger = {
  info: (...rest: any) => {
    return console.log(
      `\x1b[44m[INFO]\x1b[0m \x1b[32m${dayjs().format("DD/MM/YYYY HH:mm:ss")}\x1b[0m `,
      ...rest
    );
  },
  error: (...rest: any) => {
    logEvents({ message: `${rest}\n`, type: "errors" });
    return console.log(
      `\x1b[41m[ERROR]\x1b[0m \x1b[91m${dayjs().format("DD/MM/YYYY HH:mm:ss")}\x1b[0m `,
      ...rest
    );
  },
  write: (rest: string) => {
    const msg = rest.replace(/\u001b\[\d+m/g, "");
    logEvents({ message: msg, type: "requests" });

    return console.log(
      `\x1b[43mREQUEST\x1b[0m \x1b[33m${dayjs().format("DD/MM/YYYY HH:mm:ss")}\x1b[0m `,
      rest
    );
  },
};

export default logger;
