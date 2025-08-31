import { Request, Response } from "express";
import { BanService } from "../ban.service";

const banService = new BanService();

export const blockUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await banService.toggleUserBlock(userId,);

    const message =
      result.action === "blocked"
        ? "User blocked successfully"
        : "User unblocked successfully";

    res.status(200).json({
      message,
      data: result.user,
      action: result.action,
    });
  } catch (error: any) {
    console.error("Error toggling user block status:", error);
    res.status(400).json({
      message: error.message || "Failed to toggle user block status",
    });
  }
};
