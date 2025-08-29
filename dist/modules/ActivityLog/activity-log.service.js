"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const activity_log_schema_1 = __importDefault(require("../../Schema/ActivityLog/activity-log.schema"));
const mongoose_1 = require("mongoose");
class ActivityLogService {
    static async logActivity(userId, action, description, metadata, ipAddress, userAgent) {
        try {
            const activityLog = await activity_log_schema_1.default.create({
                userId,
                action,
                description,
                metadata: metadata || {},
                ipAddress,
                userAgent,
            });
            return activityLog;
        }
        catch (error) {
            console.error("Failed to log activity:", error);
            throw new Error("Failed to log activity");
        }
    }
    static async getUserActivityHistory(userId, options = {}) {
        const { action, startDate, endDate, page = 1, limit = 50 } = options;
        const query = { userId };
        if (action)
            query.action = action;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = startDate;
            if (endDate)
                query.createdAt.$lte = endDate;
        }
        const skip = (page - 1) * limit;
        const [activities, total] = await Promise.all([
            activity_log_schema_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            activity_log_schema_1.default.countDocuments(query),
        ]);
        return {
            activities,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    static async getUserActivityStats(userId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const pipeline = [
            {
                $match: {
                    userId: new mongoose_1.Types.ObjectId(String(userId)),
                    createdAt: { $gte: startDate },
                },
            },
            {
                $facet: {
                    totalActivities: [{ $count: "count" }],
                    activitiesByAction: [
                        { $group: { _id: "$action", count: { $sum: 1 } } },
                    ],
                    activitiesByDay: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                                },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ],
                },
            },
        ];
        const result = await activity_log_schema_1.default.aggregate(pipeline);
        const stats = result[0];
        return {
            totalActivities: stats.totalActivities[0]?.count || 0,
            activitiesByAction: stats.activitiesByAction.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            activitiesByDay: stats.activitiesByDay.map((item) => ({
                date: item._id,
                count: item.count,
            })),
        };
    }
    static async getRecentActivities(userId, limit = 10) {
        return activity_log_schema_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }
    static async cleanupOldLogs(daysToKeep = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await activity_log_schema_1.default.deleteMany({
            createdAt: { $lt: cutoffDate },
        });
        return { deletedCount: result.deletedCount || 0 };
    }
}
exports.ActivityLogService = ActivityLogService;
exports.default = ActivityLogService;
