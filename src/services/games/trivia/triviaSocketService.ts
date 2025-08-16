import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../../../configuration/config";

const SERVER_URL = BASE_URL;

let socket: Socket | null = null;

export const connectTriviaSocket = () => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
  }
  return socket;
};

export const disconnectTriviaSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getTriviaSocket = () => socket;
