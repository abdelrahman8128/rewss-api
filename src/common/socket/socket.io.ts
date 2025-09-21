import { Server } from "socket.io";
import { ioSocket } from "../../app";
import { chatSocket } from "./chat/chat.socket";
import { socketAuthenticationMiddleware } from "../../Middleware/authrization/socket.authentication.middleware";

let notificationNamespace: ReturnType<Server["of"]>;

export const socketFunction = () => {
  const chatNamespace = ioSocket.of("/chat");
  //  const onlineNamespace = ioSocket.of('/online');
  //  notificationNamespace = ioSocket.of('/notification');

  // Apply authentication middleware to chat namespace
  chatNamespace.use(socketAuthenticationMiddleware);

  chatSocket(chatNamespace);
};
