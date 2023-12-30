import { BookingService } from "@/services";
import { dateFormat } from "@/utils";
import { env } from "config";
import cron from "node-cron";
import type { Server } from "socket.io";

const CONFIRM_ONE_DAY = env.CRON_ONE_HOUR;
const CONFIRM_ONE_MIN = env.CRON_ONE_MIN;

class CronHelper {
  constructor(socketIO: Server) {
    this.confirmExaminationBeforeOneDay(socketIO);
  }

  // Nhắc lịch trước 1 ngày
  private confirmExaminationBeforeOneDay = (socketIO: Server) => {
    let isRequesting = false;

    cron.schedule(
      `${CONFIRM_ONE_MIN} ${CONFIRM_ONE_DAY} * * *`,
      // `*/5 * * * * *`,
      async () => {
        if (!isRequesting) {
          try {
            await BookingService.confirmExamBeforeOneDay(socketIO);
            console.log("Cron Confirm Examination Before One Day :)) ", dateFormat());
          } catch (error) {
            console.log(`error  cron`, error);
          } finally {
            isRequesting = false;
          }
        }
      },
      {
        timezone: "Asia/Ho_Chi_Minh",
      }
    );
  };
}

export default CronHelper;
