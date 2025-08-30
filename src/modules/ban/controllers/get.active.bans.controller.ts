import { Request, Response } from "express";
import { BanService } from "../ban.service";

const banService = new BanService();

export const getActiveBansController = async (req: Request, res: Response) => {
  try {
    // Get active bans
    const activeBans = await banService.getActiveBans();

    return res.status(200).json({
      message: "Active bans retrieved successfully",
      data: activeBans,
    });
  } catch (error: any) {
    console.error("Error getting active bans:", error);
    return res.status(400).json({
      message: error.message || "Failed to get active bans",
    });
  }
};
