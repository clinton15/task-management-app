import "dotenv/config";
import { createServer } from "node:http";

import app from "./app.js";
import connectDB from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import { initializeSocket } from "./socket.js";

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error("Missing required environment variable: JWT_SECRET");
    process.exit(1);
  }

  await connectDB();
  await seedAdmin();

  const httpServer = createServer(app);

  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
};

startServer();
