import { Request, Response } from "express";
import { AddressService } from "../address.service";

const addressService = new AddressService();

export const getDefaultAddressController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user._id;

    // Get the default address
    const address = await addressService.getDefaultAddress(userId);

    if (!address) {
      return res.status(404).json({
        message: "No default address found",
      });
    }

    return res.status(200).json({
      message: "Default address retrieved successfully",
      data: address,
    });
  } catch (error: any) {
    console.error("Error getting default address:", error);
    return res.status(500).json({
      message: error.message || "Failed to retrieve default address",
    });
  }
};
