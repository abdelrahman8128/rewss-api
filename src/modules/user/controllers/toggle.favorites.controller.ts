import { UserService } from "../user.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const toggleFavoritesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userService = new UserService();

    try {
      const userId = req.user?._id;
      const { adId } = req.params;

    

      if (!adId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Ad ID is required",
        });
        return;
      }

      const result = await userService.toggleFavorites(userId, adId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: result.message,
        user: result.user,
        action: result.action,
      });
    } catch (error: any) {
     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
     })
    }
  }
);
