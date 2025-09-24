import { Chat } from "../../../Schema/chat/chat.schema";
import User from "../../../Schema/User/user.schema";

export class ChatService {
  static async getUserChats(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0
        ? Math.min(Math.floor(limit), 100)
        : 20;
    const skip = (safePage - 1) * safeLimit;

    const [chats, total] = await Promise.all([
      Chat.find({ participants: userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Chat.countDocuments({ participants: userId }),
    ]);

    // Build participants map
    const participantIds = Array.from(
      new Set(
        chats.flatMap((c: any) =>
          Array.isArray(c.participants) ? c.participants : []
        )
      )
    );

    const users = await User.find({ _id: { $in: participantIds } })
      .select("name email phoneNumber avatar role username logo")
      .lean<any>();
    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(String(u._id), {
        _id: String(u._id),
        username: u.username,
        name: u.name,
        email: u.email,
        phoneNumber: u.phoneNumber,
        avatar: u.avatar,
        role: u.role,
        // include logo only if seller
        ...(u.role === "seller" && (u as any).logo
          ? { logo: (u as any).logo }
          : {}),
      });
    }

    const populatedChats = chats.map((c: any) => ({
      ...c,
      participants: (c.participants || []).map(
        (pid: string) => userMap.get(String(pid)) || pid
      ),
    }));

    return {
      chats: populatedChats,
      total,
      page: safePage,
      limit: safeLimit,
      hasMore: skip + chats.length < total,
    };
  }
}

export default ChatService;
