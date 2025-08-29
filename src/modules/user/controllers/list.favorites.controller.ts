import { UserService } from "../user.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const listFavoritesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userService = new UserService();

    try {
      const favorites = await userService.listFavorites(
        req.user._id,
        req.query
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
      }
    }
  }
);
