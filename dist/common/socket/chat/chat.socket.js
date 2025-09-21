"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSocket = void 0;
const chat_schema_1 = require("../../../Schema/chat/chat.schema");
const message_service_1 = require("../../../modules/chat/service/message.service");
const mongoose_1 = __importDefault(require("mongoose"));
function getPrivateRoomId(userA, userB) {
    return [userA, userB].sort().join("_");
}
const chatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected to chat: ${socket.id}`);
        console.log(`Authenticated user:`, socket.data.user);
        let currentRoomId = null;
        socket.on("joinRoom", async (data) => {
            const senderId = socket.data.user?.id;
            const receiverId = data.receiverId;
            if (!senderId) {
                socket.emit("error", { message: "User ID not found in token" });
                return;
            }
            if (!receiverId) {
                socket.emit("error", { message: "Receiver ID is required" });
                return;
            }
            const roomId = getPrivateRoomId(senderId, receiverId);
            currentRoomId = roomId;
            socket.join(roomId);
            let chat = await chat_schema_1.Chat.findOne({ roomId });
            if (!chat) {
                chat = new chat_schema_1.Chat({
                    participants: [senderId, receiverId],
                    roomId: roomId,
                });
                await chat.save();
            }
            console.log(`User ${senderId} joined private room: ${roomId} with ${receiverId}`);
            socket.to(roomId).emit("userJoined", {
                userId: senderId,
                roomId: roomId,
                timestamp: new Date().toISOString(),
            });
        });
        socket.on("sendMessage", async (data) => {
            const senderId = socket.data.user?.id;
            const receiverId = data.receiverId;
            if (!senderId) {
                socket.emit("error", { message: "User ID not found in token" });
                return;
            }
            const roomId = getPrivateRoomId(senderId, receiverId);
            const chat = await chat_schema_1.Chat.findOne({ roomId });
            if (!chat) {
                socket.emit("error", { message: "Chat not found" });
                return;
            }
            const message = await message_service_1.MessageService.createMessage({
                chatId: chat._id,
                senderId: senderId,
                message: data.message,
                messageType: data.messageType || "text",
                metadata: data.metadata,
            });
            console.log(`Message from ${senderId} to ${receiverId} in room ${roomId}:`, data.message, `Type: ${data.messageType || "text"}`);
            socket.to(roomId).emit("message", {
                senderId: message.senderId,
                message: message.message,
                roomId: roomId,
                timestamp: message.timestamp.toISOString(),
                messageId: message.messageId,
                messageType: message.messageType,
                status: message.status,
                metadata: message.metadata,
            });
        });
        socket.on("typing", (data) => {
            const senderId = socket.data.user?.id;
            const receiverId = data.receiverId;
            if (!senderId) {
                socket.emit("error", { message: "User ID not found in token" });
                return;
            }
            const roomId = getPrivateRoomId(senderId, receiverId);
            socket.to(roomId).emit("typing", {
                senderId: senderId,
                roomId: roomId,
                timestamp: new Date().toISOString(),
            });
        });
        socket.on("markAsRead", async (data) => {
            const senderId = socket.data.user?.id;
            if (!senderId)
                return;
            const message = await message_service_1.MessageService.markAsRead(data.messageId, senderId);
            if (message) {
                if (currentRoomId) {
                    socket.to(currentRoomId).emit("messageRead", {
                        messageId: data.messageId,
                        readBy: senderId,
                        readAt: new Date().toISOString(),
                    });
                }
            }
        });
        socket.on("markAsDelivered", async (data) => {
            const senderId = socket.data.user?.id;
            if (!senderId)
                return;
            const message = await message_service_1.MessageService.markAsDelivered(data.messageId, senderId);
            if (message) {
                if (currentRoomId) {
                    socket.to(currentRoomId).emit("messageDelivered", {
                        messageId: data.messageId,
                        deliveredTo: senderId,
                    });
                }
            }
        });
        socket.on("addReaction", async (data) => {
            const senderId = socket.data.user?.id;
            if (!senderId)
                return;
            const message = await message_service_1.MessageService.addReaction(data.messageId, senderId, data.emoji);
            if (message) {
                if (currentRoomId) {
                    socket.to(currentRoomId).emit("messageReaction", {
                        messageId: data.messageId,
                        reaction: {
                            userId: senderId,
                            emoji: data.emoji,
                            timestamp: new Date().toISOString(),
                        },
                    });
                }
            }
        });
        socket.on("removeReaction", async (data) => {
            const senderId = socket.data.user?.id;
            if (!senderId)
                return;
            const message = await message_service_1.MessageService.removeReaction(data.messageId, senderId);
            if (message) {
                if (currentRoomId) {
                    socket.to(currentRoomId).emit("reactionRemoved", {
                        messageId: data.messageId,
                        userId: senderId,
                    });
                }
            }
        });
        socket.on("editMessage", async (data) => {
            const senderId = socket.data.user?.id;
            if (!senderId)
                return;
            const message = await message_service_1.MessageService.editMessage(data.messageId, data.newMessage, senderId);
            if (message) {
                if (currentRoomId) {
                    socket.to(currentRoomId).emit("messageEdited", {
                        messageId: data.messageId,
                        newMessage: data.newMessage,
                        editedAt: message.editedAt?.toISOString(),
                    });
                }
            }
        });
        socket.on("deleteMessage", async (data) => {
            const senderId = socket.data.user?.id;
            if (!senderId)
                return;
            const message = await message_service_1.MessageService.deleteMessage(data.messageId, senderId);
            if (message) {
                if (currentRoomId) {
                    socket.to(currentRoomId).emit("messageDeleted", {
                        messageId: data.messageId,
                        deletedBy: senderId,
                    });
                }
            }
        });
        socket.on("getMessages", async (data) => {
            const senderId = socket.data.user?.id;
            if (!senderId)
                return;
            try {
                const result = await message_service_1.MessageService.getMessagesByChatId(new mongoose_1.default.Types.ObjectId(data.chatId), data.page || 1, data.limit || 50);
                socket.emit("messagesResponse", {
                    messages: result.messages,
                    total: result.total,
                    hasMore: result.hasMore,
                });
            }
            catch (error) {
                socket.emit("error", { message: "Failed to fetch messages" });
            }
        });
        socket.on("disconnect", (reason) => {
            console.log(`User disconnected from chat: ${socket.id}, reason: ${reason}`);
        });
    });
};
exports.chatSocket = chatSocket;
