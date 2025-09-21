import { Message, IMessage } from "../../../Schema/chat/message.schema";
import { Chat } from "../../../Schema/chat/chat.schema";
import mongoose from "mongoose";

export class MessageService {
  // Create a new message
  static async createMessage(data: {
    chatId: mongoose.Types.ObjectId;
    senderId: string;
    message: string;
    messageType?: "text" | "image" | "file" | "audio" | "video" | "sticker";
    replyTo?: mongoose.Types.ObjectId;
    forwarded?: boolean;
    metadata?: any;
  }): Promise<IMessage> {
    const messageId = Math.random().toString(36).substr(2, 9);

    const message = new Message({
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

    // Update chat last message
    await Chat.findByIdAndUpdate(data.chatId, {
      lastMessage: data.message,
      lastMessageAt: new Date(),
    });

    return savedMessage;
  }

  // Get messages by chat ID with pagination
  static async getMessagesByChatId(
    chatId: mongoose.Types.ObjectId,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: IMessage[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId, deleted: false })
        .populate("replyTo")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ chatId, deleted: false }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      total,
      hasMore: skip + messages.length < total,
    };
  }

  // Get message by ID
  static async getMessageById(messageId: string): Promise<IMessage | null> {
    return await Message.findOne({ messageId, deleted: false }).populate(
      "replyTo"
    );
  }

  // Update message status
  static async updateMessageStatus(
    messageId: string,
    status: "sending" | "sent" | "delivered" | "read" | "failed"
  ): Promise<IMessage | null> {
    return await Message.findOneAndUpdate(
      { messageId },
      { status },
      { new: true }
    );
  }

  // Mark message as delivered
  static async markAsDelivered(
    messageId: string,
    userId: string
  ): Promise<IMessage | null> {
    const message = await Message.findOne({ messageId });
    if (!message) return null;

    if (!message.deliveredTo.includes(userId)) {
      message.deliveredTo.push(userId);
    }

    if (message.deliveredTo.length === 2) {
      message.isDelivered = true;
      message.status = "delivered";
    }

    return await message.save();
  }

  // Mark message as read
  static async markAsRead(
    messageId: string,
    userId: string
  ): Promise<IMessage | null> {
    const message = await Message.findOne({ messageId });
    if (!message) return null;

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

  // Add reaction to message
  static async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<IMessage | null> {
    const message = await Message.findOne({ messageId });
    if (!message) return null;

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      (reaction) => reaction.userId !== userId
    );

    // Add new reaction
    message.reactions.push({
      userId,
      emoji,
      timestamp: new Date(),
    });

    return await message.save();
  }

  // Remove reaction from message
  static async removeReaction(
    messageId: string,
    userId: string
  ): Promise<IMessage | null> {
    const message = await Message.findOne({ messageId });
    if (!message) return null;

    message.reactions = message.reactions.filter(
      (reaction) => reaction.userId !== userId
    );
    return await message.save();
  }

  // Edit message
  static async editMessage(
    messageId: string,
    newMessage: string,
    userId: string
  ): Promise<IMessage | null> {
    const message = await Message.findOne({ messageId, senderId: userId });
    if (!message) return null;

    message.message = newMessage;
    message.edited = true;
    message.isEdited = true;
    message.editedAt = new Date();

    // Update chat last message if this is the latest message
    const chat = await Chat.findById(message.chatId);
    if (chat && chat.lastMessage === message.message) {
      chat.lastMessage = newMessage;
      await chat.save();
    }

    return await message.save();
  }

  // Delete message (soft delete)
  static async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<IMessage | null> {
    const message = await Message.findOne({ messageId, senderId: userId });
    if (!message) return null;

    message.deleted = true;
    message.deletedAt = new Date();
    message.message = "This message was deleted";

    return await message.save();
  }

  // Get unread messages count for user
  static async getUnreadCount(userId: string): Promise<number> {
    // Get all chats where user is a participant
    const userChats = await Chat.find({ participants: userId }).select("_id");
    const chatIds = userChats.map((chat) => chat._id);

    return await Message.countDocuments({
      chatId: { $in: chatIds },
      senderId: { $ne: userId }, // Exclude messages sent by the user
      deleted: false,
      readBy: { $not: { $elemMatch: { userId } } },
    });
  }

  // Get messages by user (sent and received)
  static async getMessagesByUser(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: IMessage[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    // Get all chats where user is a participant
    const userChats = await Chat.find({ participants: userId }).select("_id");
    const chatIds = userChats.map((chat) => chat._id);

    const [messages, total] = await Promise.all([
      Message.find({
        chatId: { $in: chatIds },
        deleted: false,
      })
        .populate("replyTo")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({
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

  // Search messages
  static async searchMessages(
    userId: string,
    query: string,
    chatId?: mongoose.Types.ObjectId
  ): Promise<IMessage[]> {
    // Get all chats where user is a participant
    const userChats = await Chat.find({ participants: userId }).select("_id");
    const chatIds = userChats.map((chat) => chat._id);

    const searchQuery: any = {
      chatId: { $in: chatIds },
      deleted: false,
      message: { $regex: query, $options: "i" },
    };

    if (chatId) {
      searchQuery.chatId = chatId;
    }

    return await Message.find(searchQuery)
      .populate("replyTo")
      .sort({ timestamp: -1 })
      .limit(100);
  }
}
