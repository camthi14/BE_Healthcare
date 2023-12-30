import type { Socket } from "socket.io";

export {};

declare module "socket.io" {
  export interface Socket {
    userId?: string;
  }
}
