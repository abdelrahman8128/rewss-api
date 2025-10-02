import { Namespace, Socket } from "socket.io";
import { Chat } from "../../../Schema/chat/chat.schema";
import { Message } from "../../../Schema/chat/message.schema";
import { MessageService } from "../../../modules/chat/service/message.service";
import mongoose from "mongoose";

function getPrivateRoomId(userA: string, userB: string) {
  return [userA, userB].sort().join("_");
}

export const chatSocket = (namespace: Namespace) => {
  // Track room participants  Map<roomId, Set<userId>>
  const roomParticipants = new Map<string, Set<string>>();
  // Track user -> connected socket ids Map<userId, Set<socketId>>
  const userIdToSockets = new Map<string, Set<string>>();

  namespace.on("connection", async (socket: Socket) => {
    console.log(`User connected to chat: ${socket.id}`);
    console.log(`Authenticated user:`, socket.data.user);

    let currentRoomId: string | null = null;
    const currentUserId = socket.data.user?.id as string | undefined;

    // Register socket under user id
    if (currentUserId) {
      if (!userIdToSockets.has(currentUserId)) {
        userIdToSockets.set(currentUserId, new Set());
      }
      userIdToSockets.get(currentUserId)!.add(socket.id);

      // Send unread message count when user connects
      try {
        const unreadCount = await MessageService.getUnreadCount(currentUserId);
        socket.emit("unreadCount", { count: unreadCount });
      } catch (error) {
        console.error("Error getting unread count:", error);
      }
    }

    // Handle room joining
    socket.on("joinRoom", async (data: { receiverId: string }) => {
      const senderId = socket.data.user?.id;
      const receiverId = data.receiverId;

      if (!senderId || !receiverId) {
        socket.emit("error", { message: "Missing senderId or receiverId" });
        return;
      }

      const roomId = getPrivateRoomId(senderId, receiverId);
      currentRoomId = roomId;
      socket.join(roomId);

      // Track room participants
      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Set());
      }
      roomParticipants.get(roomId)?.add(senderId);

      // Find or create chat
      let chat = await Chat.findOne({ roomId });
      if (!chat) {
        chat = new Chat({ participants: [senderId, receiverId], roomId });
        await chat.save();
      }

      // Load chat history
      try {
        const result = await MessageService.getMessagesByChatId(
          chat._id as mongoose.Types.ObjectId,
          1,
          50
        );
        socket.emit("messagesResponse", {
          messages: result.messages,
          total: result.total,
          hasMore: result.hasMore,
          chatId: chat._id,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to load chat history" });
      }

      // Mark all messages as read for the user who just joined
      try {
        const newlyRead = await MessageService.markAllAsReadInChat(
          chat._id as mongoose.Types.ObjectId,
          senderId
        );
        if (newlyRead.length > 0) {
          for (const msg of newlyRead) {
            // Notify only the original sender of each message by their socket(s)
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
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }

      socket.to(roomId).emit("userJoined", {
        userId: senderId,
        roomId,
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
        file?: any;
      }) => {
        try {
          const senderId = socket.data.user?.id;
          const receiverId = data.receiverId;
          if (!senderId || !receiverId) {
            socket.emit("error", { message: "Invalid sender/receiver" });
            return;
          }

          const roomId = getPrivateRoomId(senderId, receiverId);
          const chat = await Chat.findOne({ roomId });
          if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
          }

          // Normalize metadata/file for MessageService
          const messageType =
            (data.messageType as
              | "text"
              | "image"
              | "file"
              | "audio"
              | "video"
              | "sticker") || "text";
          const metadata: any = { ...(data.metadata || {}) };
          // MessageService expects file under metadata.file
          if (messageType !== "text" && data.file) {
            metadata.file = data.file;
          }

          // Save message
          const message = await MessageService.createMessage({
            chatId: chat._id as mongoose.Types.ObjectId,
            senderId,
            message: data.message,
            messageType,
            metadata,
          });

          // Broadcast message to users in the room
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

          // Get chat participants from database
          const chatParticipants = chat.participants;
          const roomActiveParticipants = roomParticipants.get(roomId);

          // Handle participants who are in the room (mark as read)
          if (roomActiveParticipants) {
            for (const userId of roomActiveParticipants) {
              if (userId !== senderId) {
                // المستقبل فاتح الروم فعلاً → اعتبرها Seen
                const readMessage = await MessageService.markAsRead(
                  message.messageId,
                  userId
                );
                socket.emit("messageRead", {
                  messageId: readMessage?.messageId,
                  readBy: userId,
                  readAt: new Date().toISOString(),
                });
              }
            }
          }

          // Handle participants who are connected but not in the room (send notification)
          for (const participantId of chatParticipants) {
            if (participantId !== senderId) {
              // Check if user is connected to socket but not in the room
              const userSockets = userIdToSockets.get(participantId);
              const isInRoom = roomActiveParticipants?.has(participantId);

              if (userSockets && userSockets.size > 0 && !isInRoom) {
                // User is connected but not in room - send notification
                for (const socketId of userSockets) {
                  namespace.to(socketId).emit("messageNotification", {
                    senderId: message.senderId,
                    message: message.message,
                    roomId,
                    timestamp: message.timestamp.toISOString(),
                    messageId: message.messageId,
                    messageType: message.messageType,
                    chatId: chat._id,
                    senderName: socket.data.user?.name || "Unknown", // Add sender name if available
                  });
                }

                // Mark as delivered since user is connected
                const deliveredMessage = await MessageService.markAsDelivered(
                  message.messageId,
                  participantId
                );
                socket.emit("messageDelivered", {
                  messageId: deliveredMessage?.messageId,
                  deliveredTo: participantId,
                });
              } else if (!userSockets || userSockets.size === 0) {
                // User is not connected at all - just mark as delivered when they come online
                // This will be handled when they connect and join the room
              }
            }
          }
        } catch (error) {
          socket.emit("messageError", {
            message: `Failed to send message: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            originalMessage: data.message,
          });
        }
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
            namespace.to(currentRoomId).emit("messageReaction", {
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
          namespace.to(currentRoomId).emit("reactionRemoved", {
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
            namespace.to(currentRoomId).emit("messageEdited", {
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
          namespace.to(currentRoomId).emit("messageDeleted", {
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

    // Handle leaving room
    socket.on("leaveRoom", () => {
      if (currentRoomId && socket.data.user?.id) {
        const participants = roomParticipants.get(currentRoomId);
        if (participants) {
          participants.delete(socket.data.user.id);
          console.log(`User ${socket.data.user.id} left room ${currentRoomId}`);

          // If room is empty, clean up
          if (participants.size === 0) {
            roomParticipants.delete(currentRoomId);
            console.log(`Cleaned up empty room ${currentRoomId}`);
          }
        }
        currentRoomId = null;
      }
    });

    // Handle getting room participants (for debugging)
    socket.on("getRoomParticipants", () => {
      if (currentRoomId) {
        const participants = roomParticipants.get(currentRoomId);
        socket.emit("roomParticipants", {
          roomId: currentRoomId,
          participants: participants ? Array.from(participants) : [],
        });
      }
    });

    // Handle getting unread messages for user
    socket.on("getUnreadMessages", async () => {
      const userId = socket.data.user?.id;
      if (!userId) return;

      try {
        // Get all chats where user is a participant
        const userChats = await Chat.find({ participants: userId });
        const unreadMessages = [];

        for (const chat of userChats) {
          // Get latest unread message from each chat
          const latestUnread = await Message.findOne({
            chatId: chat._id,
            senderId: { $ne: userId },
            deleted: false,
            readBy: { $not: { $elemMatch: { userId } } },
          }).sort({ timestamp: -1 });

          if (latestUnread) {
            unreadMessages.push({
              chatId: chat._id,
              roomId: chat.roomId,
              senderId: latestUnread.senderId,
              message: latestUnread.message,
              messageType: latestUnread.messageType,
              timestamp: latestUnread.timestamp.toISOString(),
              messageId: latestUnread.messageId,
            });
          }
        }

        socket.emit("unreadMessages", { messages: unreadMessages });
      } catch (error) {
        socket.emit("error", { message: "Failed to fetch unread messages" });
      }
    });

    // Handle ping/heartbeat
    socket.on("ping", (data) => {
      socket.emit("pong", { timestamp: data.timestamp });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(
        `User disconnected from chat: ${socket.id}, reason: ${reason}`
      );

      // Remove user from room participants
      if (currentRoomId && socket.data.user?.id) {
        const participants = roomParticipants.get(currentRoomId);
        if (participants) {
          participants.delete(socket.data.user.id);
          console.log(
            `Removed user ${socket.data.user.id} from room ${currentRoomId} participants`
          );

          // If room is empty, clean up
          if (participants.size === 0) {
            roomParticipants.delete(currentRoomId);
            console.log(`Cleaned up empty room ${currentRoomId}`);
          }
        }
      }

      // Unregister socket from user id mapping
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
