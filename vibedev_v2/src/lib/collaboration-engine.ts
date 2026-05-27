// filepath: /src/lib/collaboration-engine.ts
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const initializeMultiplayerRoom = (playgroundId: string, userId: string, userName: string) => {
  if (socketInstance) return socketInstance;

  // Replace with your authoritative WebSocket deployment endpoint
  socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "", {
    query: { room: playgroundId, userId, userName }
  });

  return socketInstance;
};

export const terminateMultiplayerRoom = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};