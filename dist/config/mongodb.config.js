"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = process.env.MONGODB_URI || "";
const connectToMongoDB = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Connected to MongoDB successfully");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
mongoose_1.default.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
});
mongoose_1.default.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});
// Connect automatically when this module is imported
connectToMongoDB();
// Export the connection for potential use elsewhere
exports.default = mongoose_1.default.connection;
