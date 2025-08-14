import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
//const env = process.env.NODE_ENV === "production" ? ".env" : ".env.development";
const env = (process.env.NODE_ENV = ".env");

dotenv.config({
  path: path.resolve(__dirname, `../../${env}`),
});
