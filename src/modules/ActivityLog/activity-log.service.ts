import ActivityLog, {
  IActivityLog,
} from "../../Schema/ActivityLog/activity-log.schema";
import { Types } from "mongoose";

export class ActivityLogService {
  /**
   * Simple reusable method to log any user activity
   */
  static async logActivity(
    userId: Types.ObjectId,
    action: string,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IActivityLog> {
    try {
      const activityLog = await ActivityLog.create({
        userId,
        action,
        description,
        metadata: metadata || {},
        ipAddress,
        userAgent,
      });

      return activityLog;
    } catch (error) {
      console.error("Failed to log activity:", error);
      throw new Error("Failed to log activity");
    }
  }

  /**
   * Get user activity history with filtering and pagination
   */
  static async getUserActivityHistory(
    userId: Types.ObjectId,
    options: {
      action?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    activities: IActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { action, startDate, endDate, page = 1, limit = 50 } = options;

    const query: any = { userId };

    if (action) query.action = action;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return {
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get activity statistics for a user
   */
  static async getUserActivityStats(
    userId: Types.ObjectId,
    days: number = 30
  ): Promise<{
    totalActivities: number;
    activitiesByAction: { [key: string]: number };
    activitiesByDay: { date: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline: any[] = [
      {
        $match: {
          userId: new Types.ObjectId(String(userId)),
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

    const result = await ActivityLog.aggregate(pipeline);
    const stats = result[0];

    return {
      totalActivities: stats.totalActivities[0]?.count || 0,
      activitiesByAction: stats.activitiesByAction.reduce(
        (acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        },
        {}
      ),
      activitiesByDay: stats.activitiesByDay.map((item: any) => ({
        date: item._id,
        count: item.count,
      })),
    };
  }

  /**
   * Get recent activities for dashboard
   */
  static async getRecentActivities(
    userId: Types.ObjectId,
    limit: number = 10
  ): Promise<IActivityLog[]> {
    return ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Delete old activity logs (for cleanup/maintenance)
   */
  static async cleanupOldLogs(
    daysToKeep: number = 365
  ): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return { deletedCount: result.deletedCount || 0 };
  }
}

export default ActivityLogService;
