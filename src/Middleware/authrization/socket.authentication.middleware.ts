import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const socketAuthenticationMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.token ||
    socket.handshake.query?.token;

  if (!token) {
    console.error(
      "Authentication Error: No token provided in socket handshake"
    );
    console.debug("Socket handshake details:", {
      auth: socket.handshake.auth,
      headers: socket.handshake.headers,
      query: socket.handshake.query,
    });
    return next(new Error("Unauthorized: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    if (!decoded) {
      return next(new Error("Unauthorized: Invalid token"));
    }
    socket.data.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return next(new Error("Unauthorized: Invalid token"));
  }
};
