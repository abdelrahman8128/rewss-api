"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketListeners = void 0;
const initializeSocketListeners = (io) => {
    const chatNamespace = io.of("/chat");
    chatNamespace.on("connection", (socket) => {
        console.log("💬 User connected to chat:", socket.id);
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`📌 User ${socket.id} joined room ${roomId}`);
            socket.to(roomId).emit("userJoined", {
                userId: socket.id,
                roomId,
            });
        });
        socket.on("sendMessage", (data) => {
            const { roomId, sender, message } = data;
            console.log(`✉️ Message from ${sender} in ${roomId}: ${message}`);
            chatNamespace.to(roomId).emit("message", {
                sender,
                message,
                roomId,
                createdAt: new Date(),
            });
        });
        socket.on("typing", (roomId) => {
            socket.to(roomId).emit("typing", { userId: socket.id });
        });
        socket.on("disconnect", (reason) => {
            console.log("❌ Chat user disconnected:", socket.id, "reason:", reason);
        });
    });
};
exports.initializeSocketListeners = initializeSocketListeners;
