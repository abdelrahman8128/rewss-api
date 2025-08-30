import { Request, Response } from "express";
import { BanService } from "../ban.service";
import { BanUserDto } from "../DTO/ban.dto";

const banService = new BanService();

export const banUserController = async (req: Request, res: Response) => {
  try {
    const { userId, banDays, reason } = req.body as BanUserDto;
    const adminId = req.user._id;

    // Ban the user
    const result = await banService.banUser(userId, adminId, banDays, reason);

    return res.status(200).json({
      message: "User banned successfully",
      data: {
        ban: result.ban,
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error("Error banning user:", error);
    return res.status(400).json({
      message: error.message || "Failed to ban user",
    });
  }
};
