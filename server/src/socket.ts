import { Server } from "socket.io";

let io: Server;

export const initializeSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-project", (projectId: string) => {
      socket.join(`project:${projectId}`);

      console.log(
        `Socket ${socket.id} joined project:${projectId}`,
      );
    });

    socket.on("leave-project", (projectId: string) => {
      socket.leave(`project:${projectId}`);

      console.log(
        `Socket ${socket.id} left project:${projectId}`,
      );
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
