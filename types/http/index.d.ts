import session, { SessionData } from "express-session";

declare module "http" {
  export interface IncomingMessage {
    session: session.Session & SessionData;
  }
}
