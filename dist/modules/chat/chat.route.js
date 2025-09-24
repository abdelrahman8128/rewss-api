"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const chat_controller_1 = require("./chat.controller");
const router = express_1.default.Router();
router.get("/my", authrization_middleware_1.authMiddleware, chat_controller_1.getMyChatsController);
exports.default = router;
