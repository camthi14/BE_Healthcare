import compression from "compression";
import { env } from "config";
import Cookies from "cookie-parser";
import cors from "cors";
import Express, { Application, RequestHandler } from "express";
import helmet from "helmet";
import type { Server } from "http";
import morgan from "morgan";
import type { Server as SocketServer } from "socket.io";
import { SOCKET_KEY } from "./constants/socket.contants";
import SocketIOController from "./controllers/socket.io.controller";
import { AppMiddleware } from "./middlewares";
import { router } from "./routes";
import { logger } from "./utils";
import CronHelper from "./helpers/cron.helper";

class App extends AppMiddleware {
  private app: Application;
  private port: number;
  private httpServer: Server | null;
  private socketController: SocketIOController;
  private socketServer: SocketServer;

  constructor(port: number) {
    super();

    this.httpServer = null;
    this.port = port;

    this.socketController = new SocketIOController();
    this.app = Express();

    const session = this.expressSession(this.app);

    this.middleware(session);
    this.publicStatic();
    this.handler();
    this.routes();
    this.catchError();
    this.socketServer = this.setSocket(session);
  }

  private middleware(session: RequestHandler) {
    this.app.use(
      cors(
        this.cors([
          env.CLIENT_ORIGIN_WEB,
          "http://192.168.1.17:5173",
          "http://127.0.0.1:8081",
          "http://localhost:8081",
        ])
      )
    );
    this.app.use(compression(this.compression()));
    this.app.use(Cookies());
    this.app.use(Express.json());
    this.app.use(Express.urlencoded({ extended: true }));
    this.app.use(helmet());
    this.app.use(morgan("dev", { stream: logger }));
    this.app.use(session);
  }

  private routes() {
    this.app.use("/", router);
  }

  private cronJob(socketIO: SocketServer) {
    new CronHelper(socketIO);
  }

  private publicStatic() {}

  private handler() {
    this.app.set("trust proxy", 1);
  }

  private catchError() {
    this.app.use(this.catchError404Resource);
    this.app.use(this.catchErrorInterValServer);
  }

  private setSocket(session: RequestHandler) {
    const { httpServer, socketServer } = this.socketController.run(this.app, session);
    this.httpServer = httpServer;
    this.app.set(SOCKET_KEY, socketServer);
    return socketServer;
  }

  public start() {
    if (this.httpServer) {
      const server = this.httpServer.listen(this.port, () => {
        logger.info(`server http on http://localhost:${this.port}`);
        this.cronJob(this.socketServer);
      });

      process.on("SIGINT", () => {
        server.close(() => logger.info("Exits servers."));
      });

      return;
    }

    const server = this.app.listen(this.port, () => {
      logger.info(`server on http://localhost:${this.port}`);
      this.cronJob(this.socketServer);
    });

    process.on("SIGINT", () => {
      server.close(() => logger.info("Exits servers."));
    });
  }
}

export default App;
