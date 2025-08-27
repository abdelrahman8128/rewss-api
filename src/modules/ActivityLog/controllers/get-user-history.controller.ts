import { Request, Response } from "express";
import ActivityLogService from "../activity-log.service";
import { Types } from "mongoose";

export const getUserActivityHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const requester: any = (req as any).user;
    let userId = requester._id;
    if (
      requester?.role === "admin" &&
      req.params?.userId &&
      Types.ObjectId.isValid(req.params.userId)
    ) {
      userId = new Types.ObjectId(req.params.userId);
    }

    const {
      entityType,
      category,
      action,
      severity,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query as any;

    const options: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    if (entityType) options.entityType = entityType as string;
    if (category) options.category = category as string;
    if (action) options.action = action as string;
    if (severity) options.severity = severity as string;
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);

    const result = await ActivityLogService.getUserActivityHistory(
      userId,
      options
    );

    res.status(200).json({
      success: true,
      message: "Activity history retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve activity history",
    });
  }
};
