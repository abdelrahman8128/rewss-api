"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActivityHistoryController = void 0;
const activity_log_service_1 = __importDefault(require("../activity-log.service"));
const mongoose_1 = require("mongoose");
const getUserActivityHistoryController = async (req, res) => {
    try {
        const requester = req.user;
        let userId = requester._id;
        if (requester?.role === "admin" &&
            req.params?.userId &&
            mongoose_1.Types.ObjectId.isValid(req.params.userId)) {
            userId = new mongoose_1.Types.ObjectId(req.params.userId);
        }
        const { entityType, category, action, severity, startDate, endDate, page = 1, limit = 50, } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        };
        if (entityType)
            options.entityType = entityType;
        if (category)
            options.category = category;
        if (action)
            options.action = action;
        if (severity)
            options.severity = severity;
        if (startDate)
            options.startDate = new Date(startDate);
        if (endDate)
            options.endDate = new Date(endDate);
        const result = await activity_log_service_1.default.getUserActivityHistory(userId, options);
        res.status(200).json({
            success: true,
            message: "Activity history retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve activity history",
        });
    }
};
exports.getUserActivityHistoryController = getUserActivityHistoryController;
