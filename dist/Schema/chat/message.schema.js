"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reactionSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    emoji: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const readBySchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    readAt: {
        type: Date,
        default: Date.now,
    },
});
const messageSchema = new mongoose_1.Schema({
    chatId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    messageId: {
        type: String,
        required: true,
        unique: true,
    },
    messageType: {
        type: String,
        enum: ["text", "image", "file", "audio", "video", "sticker"],
        default: "text",
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["sending", "sent", "delivered", "read", "failed"],
        default: "sent",
    },
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredTo: [
        {
            type: String,
        },
    ],
    readBy: [readBySchema],
    reactions: [reactionSchema],
    replyTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },
    forwarded: {
        type: Boolean,
        default: false,
    },
    edited: {
        type: Boolean,
        default: false,
    },
    isEdited: {
        type: Boolean,
        default: false,
    },
    editedAt: {
        type: Date,
        default: null,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    metadata: {
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        mimeType: String,
        duration: Number,
        thumbnailUrl: String,
    },
}, {
    timestamps: true,
});
exports.Message = mongoose_1.default.model("Message", messageSchema);
