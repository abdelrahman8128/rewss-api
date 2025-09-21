"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
class SocketService {
    constructor(io) {
        this.io = io;
        this.initializeSocketListeners();
    }
    initializeSocketListeners() {
        this.io.on("connection", (socket) => {
            console.log("✅ User connected:", socket.id);
            socket.on("ping", (data) => {
                console.log("🏓 Ping received from:", socket.id, data);
                socket.emit("pong", {
                    message: "Pong from server!",
                    timestamp: new Date().toISOString(),
                    serverId: socket.id,
                    originalData: data,
                });
            });
            socket.on("chat_message", (data) => {
                console.log("💬 Chat message from:", socket.id, data);
                this.io.emit("chat_message", {
                    ...data,
                    senderId: socket.id,
                    timestamp: new Date().toISOString(),
                });
            });
            socket.on("join_room", (roomId) => {
                console.log(`🏠 User ${socket.id} joining room: ${roomId}`);
                socket.join(roomId);
                socket.emit("joined_room", { roomId, userId: socket.id });
                socket.to(roomId).emit("user_joined", { roomId, userId: socket.id });
            });
            socket.on("leave_room", (roomId) => {
                console.log(`🚪 User ${socket.id} leaving room: ${roomId}`);
                socket.leave(roomId);
                socket.to(roomId).emit("user_left", { roomId, userId: socket.id });
            });
            socket.on("private_message", (data) => {
                console.log("🔒 Private message from:", socket.id, "to:", data.recipientId);
                socket.to(data.recipientId).emit("private_message", {
                    ...data,
                    senderId: socket.id,
                    timestamp: new Date().toISOString(),
                });
            });
            socket.on("typing_start", (data) => {
                socket.to(data.roomId || data.recipientId).emit("user_typing", {
                    userId: socket.id,
                    isTyping: true,
                    ...data,
                });
            });
            socket.on("typing_stop", (data) => {
                socket.to(data.roomId || data.recipientId).emit("user_typing", {
                    userId: socket.id,
                    isTyping: false,
                    ...data,
                });
            });
            socket.on("notification", (data) => {
                console.log("🔔 Notification from:", socket.id, data);
            });
            socket.on("status_update", (status) => {
                console.log("📊 Status update from:", socket.id, "status:", status);
                socket.broadcast.emit("user_status_changed", {
                    userId: socket.id,
                    status,
                    timestamp: new Date().toISOString(),
                });
            });
            socket.on("disconnect", (reason) => {
                console.log("❌ User disconnected:", socket.id, "reason:", reason);
                socket.broadcast.emit("user_disconnected", {
                    userId: socket.id,
                    timestamp: new Date().toISOString(),
                });
            });
            socket.on("error", (error) => {
                console.error("🚨 Socket error from:", socket.id, error);
            });
        });
    }
    emitToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }
    emitToUser(userId, event, data) {
        this.io.to(userId).emit(event, data);
    }
    emitToAll(event, data) {
        this.io.emit(event, data);
    }
    getConnectedUsers() {
        const sockets = Array.from(this.io.sockets.sockets.keys());
        return sockets;
    }
    getRoomUsers(roomId) {
        const room = this.io.sockets.adapter.rooms.get(roomId);
        return room ? Array.from(room) : [];
    }
    isUserConnected(userId) {
        return this.io.sockets.sockets.has(userId);
    }
}
exports.SocketService = SocketService;
exports.default = SocketService;
