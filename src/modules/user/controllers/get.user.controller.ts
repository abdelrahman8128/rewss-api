import { UserService } from "../user.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const getUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userService = new UserService();

    try {

    

      const userData = await userService.getUserData(req.user._id);

      res.status(StatusCodes.OK).json({
        success: true,
        data: userData,
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
