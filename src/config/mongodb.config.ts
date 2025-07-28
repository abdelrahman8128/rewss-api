import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
// Connect automatically when this module is imported
connectToMongoDB();

// Export the connection for potential use elsewhere
export default mongoose.connection;
