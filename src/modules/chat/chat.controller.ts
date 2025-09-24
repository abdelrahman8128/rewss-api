import { Request, Response } from "express";
import ChatService from "./service/chat.service";

export async function getMyChatsController(req: Request, res: Response) {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = parseInt(String(req.query.page || "1"), 10);
    const limit = parseInt(String(req.query.limit || "20"), 10);

    const result = await ChatService.getUserChats(userId, page, limit);
    return res.json({
      data: result.chats,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
