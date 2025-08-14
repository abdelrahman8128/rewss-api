import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
const env = process.env.NODE_ENV === "production" ? ".env" : ".env.development";
export default dotenv.config({
  path: path.resolve(__dirname, `../../${env}`),
});
