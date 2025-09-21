"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthenticationMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socketAuthenticationMiddleware = async (socket, next) => {
    const token = socket.handshake.auth?.token ||
        socket.handshake.headers?.token ||
        socket.handshake.query?.token;
    if (!token) {
        console.error("Authentication Error: No token provided in socket handshake");
        console.debug("Socket handshake details:", {
            auth: socket.handshake.auth,
            headers: socket.handshake.headers,
            query: socket.handshake.query,
        });
        return next(new Error("Unauthorized: No token provided"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
        if (!decoded) {
            return next(new Error("Unauthorized: Invalid token"));
        }
        socket.data.user = decoded;
        next();
    }
    catch (error) {
        console.error("JWT verification failed:", error);
        return next(new Error("Unauthorized: Invalid token"));
    }
};
exports.socketAuthenticationMiddleware = socketAuthenticationMiddleware;
