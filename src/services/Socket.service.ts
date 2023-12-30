import { ExpoServerSDK } from "@/helpers";
import { Server } from "socket.io";
import SaveExpoPushTokenService from "./SaveExpoPushToken.service";
import { SocketEventsName } from "@/constants/socket.contants";
import { NotificationModel } from "@/models";

export type SavePushTokenExpoPayload = {
  expoPushToken: string;
  userId: string;
};

class SocketService {
  public async savePushTokenExpo(
    { expoPushToken, userId }: SavePushTokenExpoPayload,
    socket: Server
  ) {
    console.log({ userId, expoPushToken });

    if (!userId || !expoPushToken) return;

    const expo = new ExpoServerSDK();

    if (!expo.isExpoPushToken(expoPushToken)) return;

    const expoExists = await SaveExpoPushTokenService.findOne({ user_id: userId });

    if (!expoExists) {
      await SaveExpoPushTokenService.create({
        actor_type: "patient",
        expo_push_token: expoPushToken,
        user_id: userId,
      });
    } else {
      if (expoExists.expo_push_token !== expoPushToken)
        await SaveExpoPushTokenService.update({ expo_push_token: expoPushToken }, expoExists.id!);
    }
  }

  public getCountNotification = async (socket: Server, patientId: string) => {
    const response = await NotificationModel.count({
      actor_type: "patient",
      user_id: patientId,
      is_read: 0,
    });

    socket.to(`${patientId}`).emit(SocketEventsName.GET_COUNT_NOTIFICATION, response);
  };
}

export default SocketService;
