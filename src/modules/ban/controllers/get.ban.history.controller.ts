import { Request, Response } from "express";
import { BanService } from "../ban.service";

const banService = new BanService();

export const getBanHistoryController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Get ban history
    const banHistory = await banService.getUserBanHistory(userId);

    return res.status(200).json({
      message: "Ban history retrieved successfully",
      data: banHistory,
    });
  } catch (error: any) {
    console.error("Error getting ban history:", error);
    return res.status(400).json({
      message: error.message || "Failed to get ban history",
    });
  }
};
