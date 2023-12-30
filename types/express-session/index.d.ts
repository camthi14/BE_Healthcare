import session, { type SessionData } from "express-session";
import type { IncomingMessage } from "http";

declare module "express-session" {
  export interface SessionData {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

export interface SessionIncomingMessage extends IncomingMessage {
  session: session.Session & SessionData;
}
