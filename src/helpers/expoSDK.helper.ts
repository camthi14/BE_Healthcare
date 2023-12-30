import Expo, { ExpoPushMessage } from "expo-server-sdk";

export class ExpoServerSDK {
  private _expo: Expo;

  constructor() {
    this._expo = new Expo();
  }

  public isExpoPushToken = (expoPushToken: string) => Expo.isExpoPushToken(expoPushToken);

  public async pushToken(payload: ExpoPushMessage) {
    const chunks = this._expo.chunkPushNotifications([payload]);

    const response = await this._expo.sendPushNotificationsAsync(chunks[0]);

    return response;
  }

  get expo() {
    return this._expo;
  }
}
