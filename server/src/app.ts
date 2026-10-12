import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin ?? true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", taskRoutes);
app.use("/api/projects", projectRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    message: "Api is running",
  });
});

app.use(errorHandler);

export default app;
