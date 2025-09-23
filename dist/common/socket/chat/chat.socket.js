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
const chatSocket = (namespace) => {
    const roomParticipants = new Map();
    const userIdToSockets = new Map();
    namespace.on("connection", (socket) => {
        console.log(`User connected to chat: ${socket.id}`);
        console.log(`Authenticated user:`, socket.data.user);
        let currentRoomId = null;
        const currentUserId = socket.data.user?.id;
        if (currentUserId) {
            if (!userIdToSockets.has(currentUserId)) {
                userIdToSockets.set(currentUserId, new Set());
            }
            userIdToSockets.get(currentUserId).add(socket.id);
        }
        socket.on("joinRoom", async (data) => {
            const senderId = socket.data.user?.id;
            const receiverId = data.receiverId;
            if (!senderId || !receiverId) {
                socket.emit("error", { message: "Missing senderId or receiverId" });
                return;
            }
            const roomId = getPrivateRoomId(senderId, receiverId);
            currentRoomId = roomId;
            socket.join(roomId);
            if (!roomParticipants.has(roomId)) {
                roomParticipants.set(roomId, new Set());
            }
            roomParticipants.get(roomId)?.add(senderId);
            let chat = await chat_schema_1.Chat.findOne({ roomId });
            if (!chat) {
                chat = new chat_schema_1.Chat({ participants: [senderId, receiverId], roomId });
                await chat.save();
            }
            try {
                const result = await message_service_1.MessageService.getMessagesByChatId(chat._id, 1, 50);
                socket.emit("messagesResponse", {
                    messages: result.messages,
                    total: result.total,
                    hasMore: result.hasMore,
                    chatId: chat._id,
                });
            }
            catch (error) {
                socket.emit("error", { message: "Failed to load chat history" });
            }
            try {
                const newlyRead = await message_service_1.MessageService.markAllAsReadInChat(chat._id, senderId);
                if (newlyRead.length > 0) {
                    for (const msg of newlyRead) {
                        const senderSockets = userIdToSockets.get(msg.senderId);
                        if (senderSockets && senderSockets.size > 0) {
                            for (const sid of senderSockets) {
                                namespace.to(sid).emit("messageRead", {
                                    messageId: msg.messageId,
                                    readBy: senderId,
                                    readAt: new Date().toISOString(),
                                });
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error("Error marking messages as read:", error);
            }
            socket.to(roomId).emit("userJoined", {
                userId: senderId,
                roomId,
                timestamp: new Date().toISOString(),
            });
        });
        socket.on("sendMessage", async (data) => {
            try {
                const senderId = socket.data.user?.id;
                const receiverId = data.receiverId;
                if (!senderId || !receiverId) {
                    socket.emit("error", { message: "Invalid sender/receiver" });
                    return;
                }
                const roomId = getPrivateRoomId(senderId, receiverId);
                const chat = await chat_schema_1.Chat.findOne({ roomId });
                if (!chat) {
                    socket.emit("error", { message: "Chat not found" });
                    return;
                }
                const messageType = data.messageType || "text";
                const metadata = { ...(data.metadata || {}) };
                if (messageType !== "text" && data.file) {
                    metadata.file = data.file;
                }
                const message = await message_service_1.MessageService.createMessage({
                    chatId: chat._id,
                    senderId,
                    message: data.message,
                    messageType,
                    metadata,
                });
                namespace.to(roomId).emit("message", {
                    senderId: message.senderId,
                    message: message.message,
                    roomId,
                    timestamp: message.timestamp.toISOString(),
                    messageId: message.messageId,
                    messageType: message.messageType,
                    status: message.status,
                    metadata: message.metadata,
                    readBy: message.readBy,
                });
                const participants = roomParticipants.get(roomId);
                if (participants) {
                    for (const userId of participants) {
                        if (userId !== senderId) {
                            const readMessage = await message_service_1.MessageService.markAsRead(message.messageId, userId);
                            socket.emit("messageRead", {
                                messageId: readMessage?.messageId,
                                readBy: userId,
                                readAt: new Date().toISOString(),
                            });
                        }
                    }
                }
                else {
                    const deliveredMessage = await message_service_1.MessageService.markAsDelivered(message.messageId, receiverId);
                    socket.emit("messageDelivered", {
                        messageId: deliveredMessage?.messageId,
                        deliveredTo: receiverId,
                    });
                }
            }
            catch (error) {
                socket.emit("messageError", {
                    message: `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
                    originalMessage: data.message,
                });
            }
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
        socket.on("leaveRoom", () => {
            if (currentRoomId && socket.data.user?.id) {
                const participants = roomParticipants.get(currentRoomId);
                if (participants) {
                    participants.delete(socket.data.user.id);
                    console.log(`User ${socket.data.user.id} left room ${currentRoomId}`);
                    if (participants.size === 0) {
                        roomParticipants.delete(currentRoomId);
                        console.log(`Cleaned up empty room ${currentRoomId}`);
                    }
                }
                currentRoomId = null;
            }
        });
        socket.on("getRoomParticipants", () => {
            if (currentRoomId) {
                const participants = roomParticipants.get(currentRoomId);
                socket.emit("roomParticipants", {
                    roomId: currentRoomId,
                    participants: participants ? Array.from(participants) : [],
                });
            }
        });
        socket.on("ping", (data) => {
            socket.emit("pong", { timestamp: data.timestamp });
        });
        socket.on("disconnect", (reason) => {
            console.log(`User disconnected from chat: ${socket.id}, reason: ${reason}`);
            if (currentRoomId && socket.data.user?.id) {
                const participants = roomParticipants.get(currentRoomId);
                if (participants) {
                    participants.delete(socket.data.user.id);
                    console.log(`Removed user ${socket.data.user.id} from room ${currentRoomId} participants`);
                    if (participants.size === 0) {
                        roomParticipants.delete(currentRoomId);
                        console.log(`Cleaned up empty room ${currentRoomId}`);
                    }
                }
            }
            if (currentUserId) {
                const set = userIdToSockets.get(currentUserId);
                if (set) {
                    set.delete(socket.id);
                    if (set.size === 0) {
                        userIdToSockets.delete(currentUserId);
                    }
                }
            }
        });
    });
};
exports.chatSocket = chatSocket;
