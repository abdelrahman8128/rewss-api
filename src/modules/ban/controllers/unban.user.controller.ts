import { Request, Response } from "express";
import { BanService } from "../ban.service";
import { UnbanUserDto } from "../DTO/ban.dto";

const banService = new BanService();

export const unbanUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body as UnbanUserDto;
    const adminId = req.user._id;

    // Unban the user
    const result = await banService.unbanUser(userId, adminId);

    return res.status(200).json({
      message: "User unbanned successfully",
      data: {
        ban: result.ban,
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error("Error unbanning user:", error);
    return res.status(400).json({
      message: error.message || "Failed to unban user",
    });
  }
};
