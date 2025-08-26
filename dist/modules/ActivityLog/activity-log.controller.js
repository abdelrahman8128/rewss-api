"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldLogsController = exports.logCustomActivityController = exports.getActivitiesByEntityController = exports.getRecentActivitiesController = exports.getUserActivityStatsController = exports.getUserActivityHistoryController = void 0;
const activity_log_service_1 = __importDefault(require("./activity-log.service"));
const mongoose_1 = require("mongoose");
const getUserActivityHistoryController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { entityType, category, action, severity, startDate, endDate, page = 1, limit = 50 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
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
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve activity history"
        });
    }
};
exports.getUserActivityHistoryController = getUserActivityHistoryController;
const getUserActivityStatsController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { days = 30 } = req.query;
        const stats = await activity_log_service_1.default.getUserActivityStats(userId, parseInt(days));
        res.status(200).json({
            success: true,
            message: "Activity statistics retrieved successfully",
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve activity statistics"
        });
    }
};
exports.getUserActivityStatsController = getUserActivityStatsController;
const getRecentActivitiesController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 10 } = req.query;
        const activities = await activity_log_service_1.default.getRecentActivities(userId, parseInt(limit));
        res.status(200).json({
            success: true,
            message: "Recent activities retrieved successfully",
            data: activities
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve recent activities"
        });
    }
};
exports.getRecentActivitiesController = getRecentActivitiesController;
const getActivitiesByEntityController = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user._id;
        const options = {
            entityType: entityType,
            page: parseInt(page),
            limit: parseInt(limit)
        };
        const result = await activity_log_service_1.default.getUserActivityHistory(userId, options);
        res.status(200).json({
            success: true,
            message: "Entity activities retrieved successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve entity activities"
        });
    }
};
exports.getActivitiesByEntityController = getActivitiesByEntityController;
const logCustomActivityController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { entityType, entityId, action, category, description, reason, metadata, severity = "low" } = req.body;
        const activityLog = await activity_log_service_1.default.logActivity(userId, action, description, {
            entityType,
            entityId: entityId ? new mongoose_1.Types.ObjectId(entityId) : undefined,
            category,
            reason,
            severity,
            ...metadata
        }, req.ip, req.get('User-Agent'));
        res.status(201).json({
            success: true,
            message: "Activity logged successfully",
            data: activityLog
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to log activity"
        });
    }
};
exports.logCustomActivityController = logCustomActivityController;
const cleanupOldLogsController = async (req, res) => {
    try {
        const { daysToKeep = 365 } = req.body;
        const result = await activity_log_service_1.default.cleanupOldLogs(parseInt(daysToKeep));
        res.status(200).json({
            success: true,
            message: "Old logs cleaned up successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to cleanup old logs"
        });
    }
};
exports.cleanupOldLogsController = cleanupOldLogsController;
