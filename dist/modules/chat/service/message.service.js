"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const message_schema_1 = require("../../../Schema/chat/message.schema");
const chat_schema_1 = require("../../../Schema/chat/chat.schema");
class MessageService {
    static async createMessage(data) {
        const messageId = Math.random().toString(36).substr(2, 9);
        const message = new message_schema_1.Message({
            ...data,
            messageId,
            messageType: data.messageType || "text",
            forwarded: data.forwarded || false,
            status: "sent",
            isDelivered: false,
            deliveredTo: [],
            readBy: [],
            reactions: [],
            edited: false,
            isEdited: false,
            deleted: false,
        });
        const savedMessage = await message.save();
        await chat_schema_1.Chat.findByIdAndUpdate(data.chatId, {
            lastMessage: data.message,
            lastMessageAt: new Date(),
        });
        return savedMessage;
    }
    static async getMessagesByChatId(chatId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            message_schema_1.Message.find({ chatId, deleted: false })
                .populate("replyTo")
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            message_schema_1.Message.countDocuments({ chatId, deleted: false }),
        ]);
        return {
            messages: messages.reverse(),
            total,
            hasMore: skip + messages.length < total,
        };
    }
    static async getMessageById(messageId) {
        return await message_schema_1.Message.findOne({ messageId, deleted: false }).populate("replyTo");
    }
    static async updateMessageStatus(messageId, status) {
        return await message_schema_1.Message.findOneAndUpdate({ messageId }, { status }, { new: true });
    }
    static async markAsDelivered(messageId, userId) {
        const message = await message_schema_1.Message.findOne({ messageId });
        if (!message)
            return null;
        if (!message.deliveredTo.includes(userId)) {
            message.deliveredTo.push(userId);
        }
        if (message.deliveredTo.length === 2) {
            message.isDelivered = true;
            message.status = "delivered";
        }
        return await message.save();
    }
    static async markAsRead(messageId, userId) {
        const message = await message_schema_1.Message.findOne({ messageId });
        if (!message)
            return null;
        const alreadyRead = message.readBy.some((read) => read.userId === userId);
        if (!alreadyRead) {
            message.readBy.push({
                userId,
                readAt: new Date(),
            });
        }
        message.status = "read";
        return await message.save();
    }
    static async addReaction(messageId, userId, emoji) {
        const message = await message_schema_1.Message.findOne({ messageId });
        if (!message)
            return null;
        message.reactions = message.reactions.filter((reaction) => reaction.userId !== userId);
        message.reactions.push({
            userId,
            emoji,
            timestamp: new Date(),
        });
        return await message.save();
    }
    static async removeReaction(messageId, userId) {
        const message = await message_schema_1.Message.findOne({ messageId });
        if (!message)
            return null;
        message.reactions = message.reactions.filter((reaction) => reaction.userId !== userId);
        return await message.save();
    }
    static async editMessage(messageId, newMessage, userId) {
        const message = await message_schema_1.Message.findOne({ messageId, senderId: userId });
        if (!message)
            return null;
        message.message = newMessage;
        message.edited = true;
        message.isEdited = true;
        message.editedAt = new Date();
        const chat = await chat_schema_1.Chat.findById(message.chatId);
        if (chat && chat.lastMessage === message.message) {
            chat.lastMessage = newMessage;
            await chat.save();
        }
        return await message.save();
    }
    static async deleteMessage(messageId, userId) {
        const message = await message_schema_1.Message.findOne({ messageId, senderId: userId });
        if (!message)
            return null;
        message.deleted = true;
        message.deletedAt = new Date();
        message.message = "This message was deleted";
        return await message.save();
    }
    static async getUnreadCount(userId) {
        const userChats = await chat_schema_1.Chat.find({ participants: userId }).select("_id");
        const chatIds = userChats.map((chat) => chat._id);
        return await message_schema_1.Message.countDocuments({
            chatId: { $in: chatIds },
            senderId: { $ne: userId },
            deleted: false,
            readBy: { $not: { $elemMatch: { userId } } },
        });
    }
    static async getMessagesByUser(userId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const userChats = await chat_schema_1.Chat.find({ participants: userId }).select("_id");
        const chatIds = userChats.map((chat) => chat._id);
        const [messages, total] = await Promise.all([
            message_schema_1.Message.find({
                chatId: { $in: chatIds },
                deleted: false,
            })
                .populate("replyTo")
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            message_schema_1.Message.countDocuments({
                chatId: { $in: chatIds },
                deleted: false,
            }),
        ]);
        return {
            messages: messages.reverse(),
            total,
            hasMore: skip + messages.length < total,
        };
    }
    static async searchMessages(userId, query, chatId) {
        const userChats = await chat_schema_1.Chat.find({ participants: userId }).select("_id");
        const chatIds = userChats.map((chat) => chat._id);
        const searchQuery = {
            chatId: { $in: chatIds },
            deleted: false,
            message: { $regex: query, $options: "i" },
        };
        if (chatId) {
            searchQuery.chatId = chatId;
        }
        return await message_schema_1.Message.find(searchQuery)
            .populate("replyTo")
            .sort({ timestamp: -1 })
            .limit(100);
    }
}
exports.MessageService = MessageService;
