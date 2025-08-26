import { Request, Response } from "express";
import ActivityLogService from "./activity-log.service";
import { Types } from "mongoose";

/**
 * Get user's activity history with filtering and pagination
 */
export const getUserActivityHistoryController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const {
      entityType,
      category,
      action,
      severity,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const options: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    if (entityType) options.entityType = entityType as string;
    if (category) options.category = category as string;
    if (action) options.action = action as string;
    if (severity) options.severity = severity as string;
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);

    const result = await ActivityLogService.getUserActivityHistory(userId, options);

    res.status(200).json({
      success: true,
      message: "Activity history retrieved successfully",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve activity history"
    });
  }
};

/**
 * Get user's activity statistics
 */
export const getUserActivityStatsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { days = 30 } = req.query;

    const stats = await ActivityLogService.getUserActivityStats(userId, parseInt(days as string));

    res.status(200).json({
      success: true,
      message: "Activity statistics retrieved successfully",
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve activity statistics"
    });
  }
};

/**
 * Get recent activities for dashboard
 */
export const getRecentActivitiesController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { limit = 10 } = req.query;

    const activities = await ActivityLogService.getRecentActivities(userId, parseInt(limit as string));

    res.status(200).json({
      success: true,
      message: "Recent activities retrieved successfully",
      data: activities
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recent activities"
    });
  }
};

/**
 * Get activities by entity (for admins)
 */
export const getActivitiesByEntityController = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // For now, we'll use the user's own activities, but this can be extended for admin access
    const userId = (req as any).user._id;

    const options = {
      entityType: entityType as any,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await ActivityLogService.getUserActivityHistory(userId, options);

    res.status(200).json({
      success: true,
      message: "Entity activities retrieved successfully",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve entity activities"
    });
  }
};

/**
 * Log a custom activity (for system use)
 */
export const logCustomActivityController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const {
      entityType,
      entityId,
      action,
      category,
      description,
      reason,
      metadata,
      severity = "low"
    } = req.body;

    const activityLog = await ActivityLogService.logActivity(
      userId,
      action,
      description,
      {
        entityType,
        entityId: entityId ? new Types.ObjectId(entityId) : undefined,
        category,
        reason,
        severity,
        ...metadata
      },
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: activityLog
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to log activity"
    });
  }
};

/**
 * Clean up old activity logs (admin only)
 */
export const cleanupOldLogsController = async (req: Request, res: Response) => {
  try {
    const { daysToKeep = 365 } = req.body;

    const result = await ActivityLogService.cleanupOldLogs(parseInt(daysToKeep));

    res.status(200).json({
      success: true,
      message: "Old logs cleaned up successfully",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cleanup old logs"
    });
  }
};
