"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketFunction = void 0;
const app_1 = require("../../app");
const chat_socket_1 = require("./chat/chat.socket");
const socket_authentication_middleware_1 = require("../../Middleware/authrization/socket.authentication.middleware");
let notificationNamespace;
const socketFunction = () => {
    const chatNamespace = app_1.ioSocket.of("/chat");
    chatNamespace.use(socket_authentication_middleware_1.socketAuthenticationMiddleware);
    (0, chat_socket_1.chatSocket)(chatNamespace);
};
exports.socketFunction = socketFunction;
