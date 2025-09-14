import { UserService } from "../user.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userService = new UserService();
    try {
      const updatedUser = await userService.updateUser(req.user._id, req.body, req.files as Express.Multer.File[]);
      if (!updatedUser) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not updated" });
        return;
      }
      res
        .status(StatusCodes.OK)
        .json({ message: "User updated successfully", data: updatedUser });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
    }
  }
);
