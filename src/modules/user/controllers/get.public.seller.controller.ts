import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import { UserService } from "../user.service";
import { ISeller } from "../../../Schema/User/seller.schema";

export const getPublicSellerController = asyncHandler(
  async (req: Request, res: Response) => {
    const userService = new UserService();

    const { sellerId } = req.params;
    if (!sellerId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Seller ID is required",
      });
      return;
    }

    const userData = (await userService.getUserData(sellerId)) as ISeller | any;

    if (!userData || userData.role !== "seller") {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Seller not found",
      });
      return;
    }

    const publicSeller = {
      _id: userData._id,
      username: userData.username,
      name: userData.name,
      avatar: userData.avatar,
      role: userData.role,
      createdAt: userData.createdAt,
      logo: userData.logo,
      storePhotos: userData.storePhotos,
      physicalAddress: userData.physicalAddress,
      requiredDataStatus: userData.requiredDataStatus,
    };

    res.status(StatusCodes.OK).json({ success: true, data: publicSeller });
  }
);
