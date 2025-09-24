"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyChatsController = getMyChatsController;
const chat_service_1 = __importDefault(require("./service/chat.service"));
async function getMyChatsController(req, res) {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const page = parseInt(String(req.query.page || "1"), 10);
        const limit = parseInt(String(req.query.limit || "20"), 10);
        const result = await chat_service_1.default.getUserChats(userId, page, limit);
        return res.json({
            data: result.chats,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                hasMore: result.hasMore,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
