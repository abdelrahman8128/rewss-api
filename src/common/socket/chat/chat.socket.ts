import { Namespace, Socket } from "socket.io";
import { Chat } from "../../../Schema/chat/chat.schema";
import { Message } from "../../../Schema/chat/message.schema";
import { MessageService } from "../../../modules/chat/service/message.service";
import mongoose from "mongoose";

function getPrivateRoomId(userA: string, userB: string) {
  return [userA, userB].sort().join("_");
}

export const chatSocket = (io: Namespace) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected to chat: ${socket.id}`);
    console.log(`Authenticated user:`, socket.data.user);

    let currentRoomId: string | null = null;

    // Handle room joining
    socket.on("joinRoom", async (data: { receiverId: string }) => {
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

      // Create or find chat in database
      let chat = await Chat.findOne({ roomId });
      if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          roomId: roomId,
        });
        await chat.save();
      }

      console.log(
        `User ${senderId} joined private room: ${roomId} with ${receiverId}`
      );

      socket.to(roomId).emit("userJoined", {
        userId: senderId,
        roomId: roomId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle message sending
    socket.on(
      "sendMessage",
      async (data: {
        receiverId: string;
        message: string;
        messageType?: string;
        metadata?: any;
      }) => {
        const senderId = socket.data.user?.id;
        const receiverId = data.receiverId;

        if (!senderId) {
          socket.emit("error", { message: "User ID not found in token" });
          return;
        }

        const roomId = getPrivateRoomId(senderId, receiverId);

        // Find chat
        const chat = await Chat.findOne({ roomId });
        if (!chat) {
          socket.emit("error", { message: "Chat not found" });
          return;
        }

        // Save message to database using service
        const message = await MessageService.createMessage({
          chatId: chat._id as mongoose.Types.ObjectId,
          senderId: senderId,
          message: data.message,
          messageType:
            (data.messageType as
              | "text"
              | "image"
              | "file"
              | "audio"
              | "video"
              | "sticker") || "text",
          metadata: data.metadata,
        });

        console.log(
          `Message from ${senderId} to ${receiverId} in room ${roomId}:`,
          data.message,
          `Type: ${data.messageType || "text"}`
        );

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
      }
    );

    // Handle typing indicator
    socket.on("typing", (data: { receiverId: string }) => {
      const senderId = socket.data.user?.id;
      const receiverId = data.receiverId;

      if (!senderId) {
        socket.emit("error", { message: "User ID not found in token" });
        return;
      }

      const roomId = getPrivateRoomId(senderId, receiverId);

      // Send typing indicator to the room (not to specific receiver)
      socket.to(roomId).emit("typing", {
        senderId: senderId,
        roomId: roomId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle message read
    socket.on("markAsRead", async (data: { messageId: string }) => {
      const senderId = socket.data.user?.id;
      if (!senderId) return;

      const message = await MessageService.markAsRead(data.messageId, senderId);
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

    // Handle message delivery
    socket.on("markAsDelivered", async (data: { messageId: string }) => {
      const senderId = socket.data.user?.id;
      if (!senderId) return;

      const message = await MessageService.markAsDelivered(
        data.messageId,
        senderId
      );
      if (message) {
        if (currentRoomId) {
          socket.to(currentRoomId).emit("messageDelivered", {
            messageId: data.messageId,
            deliveredTo: senderId,
          });
        }
      }
    });

    // Handle message reaction
    socket.on(
      "addReaction",
      async (data: { messageId: string; emoji: string }) => {
        const senderId = socket.data.user?.id;
        if (!senderId) return;

        const message = await MessageService.addReaction(
          data.messageId,
          senderId,
          data.emoji
        );
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
      }
    );

    // Handle remove reaction
    socket.on("removeReaction", async (data: { messageId: string }) => {
      const senderId = socket.data.user?.id;
      if (!senderId) return;

      const message = await MessageService.removeReaction(
        data.messageId,
        senderId
      );
      if (message) {
        if (currentRoomId) {
          socket.to(currentRoomId).emit("reactionRemoved", {
            messageId: data.messageId,
            userId: senderId,
          });
        }
      }
    });

    // Handle edit message
    socket.on(
      "editMessage",
      async (data: { messageId: string; newMessage: string }) => {
        const senderId = socket.data.user?.id;
        if (!senderId) return;

        const message = await MessageService.editMessage(
          data.messageId,
          data.newMessage,
          senderId
        );
        if (message) {
          if (currentRoomId) {
            socket.to(currentRoomId).emit("messageEdited", {
              messageId: data.messageId,
              newMessage: data.newMessage,
              editedAt: message.editedAt?.toISOString(),
            });
          }
        }
      }
    );

    // Handle delete message
    socket.on("deleteMessage", async (data: { messageId: string }) => {
      const senderId = socket.data.user?.id;
      if (!senderId) return;

      const message = await MessageService.deleteMessage(
        data.messageId,
        senderId
      );
      if (message) {
        if (currentRoomId) {
          socket.to(currentRoomId).emit("messageDeleted", {
            messageId: data.messageId,
            deletedBy: senderId,
          });
        }
      }
    });

    // Handle get messages
    socket.on(
      "getMessages",
      async (data: { chatId: string; page?: number; limit?: number }) => {
        const senderId = socket.data.user?.id;
        if (!senderId) return;

        try {
          const result = await MessageService.getMessagesByChatId(
            new mongoose.Types.ObjectId(data.chatId),
            data.page || 1,
            data.limit || 50
          );

          socket.emit("messagesResponse", {
            messages: result.messages,
            total: result.total,
            hasMore: result.hasMore,
          });
        } catch (error) {
          socket.emit("error", { message: "Failed to fetch messages" });
        }
      }
    );

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(
        `User disconnected from chat: ${socket.id}, reason: ${reason}`
      );
    });
  });
};
