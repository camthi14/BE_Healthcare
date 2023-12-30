import { SOCKET_KEY, SocketEventsName } from "@/constants/socket.contants";
import { CommonRequest } from "@/helpers";
import SocketService, { SavePushTokenExpoPayload } from "@/services/Socket.service";
import { env } from "config";
import type { Application, Request, RequestHandler } from "express";
import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";

class SocketIOController extends SocketService {
  static PUSH_EXPO_TOKEN = "PUSH_EXPO_TOKEN";

  private wrap = (eMD: any) => (socket: Socket, next: (err?: ExtendedError) => void) =>
    eMD(socket.request, {}, next);

  public authMiddleware = (socket: Socket, next: (err?: ExtendedError) => void) => {
    const session = socket.request?.session?.userId;
    const userId = socket.handshake.auth?.userId;

    if (!session && !userId) return next(new Error("Authentication error"));

    socket.userId = session || userId;

    next();
  };

  public run = (app: Application, sessionMiddleware: RequestHandler) => {
    const httpServer = createServer(app);

    const socketServer = new Server(httpServer, {
      cors: { origin: env.CLIENT_ORIGIN_MOBILE, credentials: true, methods: ["GET", "POST"] },
    });

    socketServer.use(this.wrap(sessionMiddleware));
    socketServer.use(this.authMiddleware);

    const io = socketServer.on("connect", (socket: Socket) => {
      io.socketsJoin(`${socket.userId}`);
      console.log(`⚡ new connected with userId : ${socket.userId}`);

      socket.on(
        SocketIOController.PUSH_EXPO_TOKEN,
        async ({ expoPushToken, userId }: SavePushTokenExpoPayload) => {
          await this.savePushTokenExpo({ expoPushToken, userId }, io);
        }
      );

      socket.on(SocketEventsName.GET_COUNT_NOTIFICATION, async ({ userId }: { userId: string }) => {
        await this.getCountNotification(io, userId);
      });

      socket.on("disconnect", () => {
        socket.disconnect();
        io.socketsLeave(`${socket.userId}`);
        console.log(`🔥: A user disconnected ${socket.userId}`);
      });
    });

    return { socketServer, httpServer };
  };

  public static getSocketServer = (req: CommonRequest | Request) => {
    return req.app.get(SOCKET_KEY) as Server;
  };
}

export default SocketIOController;
