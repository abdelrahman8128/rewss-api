# Chat Notification System

## Overview

The chat system now supports notifications for users who are connected to the socket but haven't joined a specific chat room. This ensures that users receive notifications about new messages even when they're not actively viewing the chat.

## How It Works

### 1. User Connection Tracking

- When a user connects to the socket, they are registered in the `userIdToSockets` map
- This tracks which users are currently connected and their socket IDs
- Users receive their unread message count immediately upon connection

### 2. Room vs Connected Users

- **Room Participants**: Users who have actively joined a chat room using `joinRoom`
- **Connected Users**: Users who are connected to the socket but may not be in any specific room

### 3. Message Broadcasting Logic

When a message is sent, the system handles three scenarios:

#### Scenario 1: User is in the room

- Message is broadcast to the room using `namespace.to(roomId).emit("message", ...)`
- Message is automatically marked as "read"
- User receives the full message data

#### Scenario 2: User is connected but not in the room

- User receives a `messageNotification` event instead of the full message
- Message is marked as "delivered" since the user is online
- Notification includes sender info, message preview, and chat details

#### Scenario 3: User is offline

- No immediate notification is sent
- When user comes online, they'll receive unread count and can fetch unread messages

## Socket Events

### Client → Server Events

#### `joinRoom`

```javascript
socket.emit("joinRoom", { receiverId: "user123" });
```

Joins a specific chat room and loads message history.

#### `getUnreadMessages`

```javascript
socket.emit("getUnreadMessages");
```

Retrieves all unread messages from all chats for the current user.

#### `sendMessage`

```javascript
socket.emit("sendMessage", {
  receiverId: "user123",
  message: "Hello!",
  messageType: "text",
});
```

Sends a message to another user.

### Server → Client Events

#### `messageNotification`

```javascript
// Received when user is connected but not in the chat room
{
  senderId: "user456",
  message: "Hello there!",
  roomId: "user123_user456",
  timestamp: "2023-10-02T10:30:00.000Z",
  messageId: "abc123",
  messageType: "text",
  chatId: "chat_object_id",
  senderName: "John Doe"
}
```

#### `message`

```javascript
// Received when user is actively in the chat room
{
  senderId: "user456",
  message: "Hello there!",
  roomId: "user123_user456",
  timestamp: "2023-10-02T10:30:00.000Z",
  messageId: "abc123",
  messageType: "text",
  status: "sent",
  metadata: {},
  readBy: []
}
```

#### `unreadCount`

```javascript
// Received when user connects
{
  count: 5;
}
```

#### `unreadMessages`

```javascript
// Response to getUnreadMessages request
{
  messages: [
    {
      chatId: "chat_id",
      roomId: "user1_user2",
      senderId: "user2",
      message: "Latest unread message",
      messageType: "text",
      timestamp: "2023-10-02T10:30:00.000Z",
      messageId: "msg123",
    },
  ];
}
```

## Implementation Benefits

1. **Real-time Notifications**: Users get notified immediately when they receive messages, even if not in the chat
2. **Efficient Resource Usage**: Only sends full message data to users actively in the room
3. **Proper Message Status**: Correctly handles read/delivered status based on user presence
4. **Scalable**: Works with multiple socket connections per user
5. **Offline Support**: Handles users coming online and catching up with unread messages

## Usage Example

```javascript
// Client-side implementation
const socket = io("/chat");

// Listen for notifications when not in a room
socket.on("messageNotification", (notification) => {
  // Show push notification or update UI
  showNotification(
    `New message from ${notification.senderName}: ${notification.message}`
  );
  updateUnreadBadge();
});

// Listen for messages when in a room
socket.on("message", (message) => {
  // Display message in chat UI
  displayMessage(message);
});

// Get unread count on connection
socket.on("unreadCount", (data) => {
  updateUnreadBadge(data.count);
});
```

This system ensures users never miss important messages while maintaining efficient real-time communication.
