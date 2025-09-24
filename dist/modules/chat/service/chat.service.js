"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const chat_schema_1 = require("../../../Schema/chat/chat.schema");
const user_schema_1 = __importDefault(require("../../../Schema/User/user.schema"));
class ChatService {
    static async getUserChats(userId, page = 1, limit = 20) {
        const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const safeLimit = Number.isFinite(limit) && limit > 0
            ? Math.min(Math.floor(limit), 100)
            : 20;
        const skip = (safePage - 1) * safeLimit;
        const [chats, total] = await Promise.all([
            chat_schema_1.Chat.find({ participants: userId })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean(),
            chat_schema_1.Chat.countDocuments({ participants: userId }),
        ]);
        const participantIds = Array.from(new Set(chats.flatMap((c) => Array.isArray(c.participants) ? c.participants : [])));
        const users = await user_schema_1.default.find({ _id: { $in: participantIds } })
            .select("name email phoneNumber avatar role username logo")
            .lean();
        const userMap = new Map();
        for (const u of users) {
            userMap.set(String(u._id), {
                _id: String(u._id),
                username: u.username,
                name: u.name,
                email: u.email,
                phoneNumber: u.phoneNumber,
                avatar: u.avatar,
                role: u.role,
                ...(u.role === "seller" && u.logo
                    ? { logo: u.logo }
                    : {}),
            });
        }
        const populatedChats = chats.map((c) => ({
            ...c,
            participants: (c.participants || []).map((pid) => userMap.get(String(pid)) || pid),
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
exports.ChatService = ChatService;
exports.default = ChatService;
