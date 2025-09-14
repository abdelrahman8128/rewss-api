import { Request, Response } from "express";
import { UserService } from "../user.service";
import { CreateSellerPhysicalAddressDto } from "../DTO/seller-physical-address.dto";

const userService = new UserService();

export const setSellerPhysicalAddressController = async (
  req: Request,
  res: Response
) => {
  try {
    const addressData = req.body as CreateSellerPhysicalAddressDto;
    const sellerId = req.user._id;

    // Set the seller physical address
    const seller = await userService.setSellerPhysicalAddress(
      sellerId,
      addressData
    );

    return res.status(201).json({
      message: "Physical address set successfully",
      data: {
        seller,
      },
    });
  } catch (error: any) {
    console.error("Error setting seller physical address:", error);
    return res.status(400).json({
      message: error.message || "Failed to set physical address",
    });
  }
};
