import session, { type SessionData } from "express-session";
import type { IncomingMessage } from "http";

declare module "express-session" {
  export interface SessionData {
    userId?: string | number;
    accessToken?: string;
    refreshToken?: string;
  }
}

export interface SessionIncomingMessage extends IncomingMessage {
  session: session.Session & SessionData;
}

declare module "http" {
  export interface IncomingMessage {
    session: session.Session & SessionData;
  }
}

declare module "socket.io" {
  interface Socket {
    userId?: string;
  }
}
