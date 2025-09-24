## Chat Socket Documentation

This document describes the real-time chat API over Socket.IO.

### Namespace

- **Path**: `/chat`

### Authentication

All connections to `/chat` require a JWT token. The server accepts the token in any of the following handshake locations:

- `auth.token`
- `headers.token`
- `query.token`

If the token is missing or invalid, the connection is rejected.

Example client connection:

```javascript
import { io } from "socket.io-client";

const socket = io("<BASE_URL>/chat", {
  transports: ["websocket"],
  auth: { token: "<JWT_TOKEN>" },
  // Alternatively:
  // extraHeaders: { token: "<JWT_TOKEN>" },
  // query: { token: "<JWT_TOKEN>" },
});

socket.on("connect", () => console.log("connected", socket.id));
socket.on("error", (e) => console.error("socket error", e));
```

### Private Room Model

Private 1:1 rooms are identified by a stable room id derived from the two user ids:

- `roomId = [userA, userB].sort().join("_")`

### Events

#### Client → Server

- **joinRoom**

  - Payload: `{ receiverId: string }`
  - Joins the private room with `receiverId`. Creates the chat if it does not exist. Emits `messagesResponse` to the caller with recent history and marks all messages as read for the joining user (notifies original senders via `messageRead`). Also broadcasts `userJoined` to the room.

- **sendMessage**

  - Payload: `{ receiverId: string, message: string, messageType?: "text"|"image"|"file"|"audio"|"video"|"sticker", metadata?: object, file?: { buffer: string|Buffer, originalname: string, mimetype: string, size: number } }`
  - Persists the message then emits `message` to the room. If the other participant is currently in the room, the message is immediately marked as read and `messageRead` is emitted to the sender; otherwise it is marked as delivered and `messageDelivered` is emitted to the sender.
  - Notes for file messages: If `messageType` is not `text` and `file` is provided, the server will upload it to S3 and store resulting `fileUrl`, `fileName`, `fileSize`, and `mimeType` under `metadata`.

- **typing**

  - Payload: `{ receiverId: string }`
  - Broadcasts a typing indicator to the room.

- **markAsRead**

  - Payload: `{ messageId: string }`
  - Marks a message as read by the current user and emits `messageRead` to the room.

- **markAsDelivered**

  - Payload: `{ messageId: string }`
  - Marks a message as delivered to the current user and emits `messageDelivered` to the room.

- **addReaction**

  - Payload: `{ messageId: string, emoji: string }`
  - Adds a reaction to a message and emits `messageReaction` to the room.

- **removeReaction**

  - Payload: `{ messageId: string }`
  - Removes the current user's reaction from the message and emits `reactionRemoved` to the room.

- **editMessage**

  - Payload: `{ messageId: string, newMessage: string }`
  - Edits a previously sent message (by the same user) and emits `messageEdited` to the room.

- **deleteMessage**

  - Payload: `{ messageId: string }`
  - Soft-deletes a previously sent message (by the same user) and emits `messageDeleted` to the room.

- **getMessages**

  - Payload: `{ chatId: string, page?: number = 1, limit?: number = 50 }`
  - Fetches paginated messages by `chatId` and emits `messagesResponse` to the caller.

- **leaveRoom**

  - Payload: none
  - Leaves the current room and cleans up participation tracking.

- **getRoomParticipants** (debug)

  - Payload: none
  - Emits `roomParticipants` with the current room's participant user ids.

- **ping**
  - Payload: `{ timestamp: any }`
  - Emits `pong` with the same timestamp back to the caller.

#### Server → Client

- **messagesResponse**

  - Payload: `{ messages: Message[], total: number, hasMore: boolean, chatId?: string }`

- **message**

  - Payload: `{ messageId: string, roomId: string, senderId: string, message: string, messageType: string, timestamp: string, status: string, metadata?: object, readBy?: string[] }`

- **userJoined**

  - Payload: `{ userId: string, roomId: string, timestamp: string }`

- **typing**

  - Payload: `{ senderId: string, roomId: string, timestamp: string }`

- **messageRead**

  - Payload: `{ messageId: string, readBy: string, readAt: string }`

- **messageDelivered**

  - Payload: `{ messageId: string, deliveredTo: string }`

- **messageReaction**

  - Payload: `{ messageId: string, reaction: { userId: string, emoji: string, timestamp: string } }`

- **reactionRemoved**

  - Payload: `{ messageId: string, userId: string }`

- **messageEdited**

  - Payload: `{ messageId: string, newMessage: string, editedAt?: string }`

- **messageDeleted**

  - Payload: `{ messageId: string, deletedBy: string }`

- **roomParticipants** (debug)

  - Payload: `{ roomId: string, participants: string[] }`

- **pong**

  - Payload: `{ timestamp: any }`

- **error**

  - Payload: `{ message: string }`

- **messageError**
  - Payload: `{ message: string, originalMessage?: string }`

### Minimal Client Flow Example

```javascript
// 1) Connect with token
const socket = io("<BASE_URL>/chat", { auth: { token: "<JWT>" } });

// 2) Join a private room with a recipient
socket.emit("joinRoom", { receiverId: "<OTHER_USER_ID>" });

// 3) Listen for history and new messages
socket.on("messagesResponse", ({ messages }) => console.log(messages));
socket.on("message", (msg) => console.log("new", msg));

// 4) Send a message
socket.emit("sendMessage", { receiverId: "<OTHER_USER_ID>", message: "Hi" });

// 5) Typing indicator
socket.emit("typing", { receiverId: "<OTHER_USER_ID>" });

// 6) Mark as read when appropriate
socket.emit("markAsRead", { messageId: "<MSG_ID>" });
```

### Notes

- Pagination defaults: page 1, limit 50.
- Message persistence, statuses (delivered/read), and reactions are handled server-side via `MessageService` and chat schemas.
- All timestamps are ISO strings.
