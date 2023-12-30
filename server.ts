import App from "@/app";
import { env } from "config";
import "dotenv/config";

const server = new App(env.APP_PORT);
server.start();
