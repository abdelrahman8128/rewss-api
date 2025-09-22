import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import "./config/dotenv.config"; // Load environment variables
import "./config/mongodb.config"; // Connect to the database
import "reflect-metadata";
import { socketFunction } from "./common/socket/socket.io";

import morgan from "morgan";

import appModule from "./app.route";
const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// نربط socket.io بالـ server
export const ioSocket = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 10 * 1024 * 1024, // 10MB limit for messages
  transports: ["websocket", "polling"],
});

// Initialize socket listeners
socketFunction();

app.use(
  cors({
    origin: "*",
  })
);
// Handle preflight

app.use(express.json());

app.use(morgan("dev")); // Log to console (for development)

// Initialize routes
appModule(app);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from rewss-api!");
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
