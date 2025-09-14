import { UserService } from "../user.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import { ISeller } from "../../../Schema/User/seller.schema";

// Type guard to check if user is a seller
const isSeller = (user: any): user is ISeller => {
  return user && user.role === "seller";
};

export const getUserByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userService = new UserService();

    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const userData = await userService.getUserData(userId);

      // Remove sensitive information for public profile viewing
      const publicUserData = {
        _id: userData._id,
        username: userData.username,
        name: userData.name,
        avatar: userData.avatar,
        role: userData.role,
        status: userData.status,
        createdAt: userData.createdAt,
        // Include seller-specific public data
        ...(isSeller(userData) && {
          logo: userData.logo,
          storePhotos: userData.storePhotos,
          physicalAddress: userData.physicalAddress,
          requiredDataStatus: userData.requiredDataStatus,
        }),
      };

      res.status(StatusCodes.OK).json({
        success: true,
        data: publicUserData,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      }
    }
  }
);
