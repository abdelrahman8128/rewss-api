import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import "./config/dotenv.config"; // Load environment variables
import "./config/mongodb.config"; // Connect to the database
import "reflect-metadata";

import morgan from "morgan";

import appModule from "./app.route";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight
app.options('*', cors());

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
