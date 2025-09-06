import { Request, Response } from "express";
import { AddressService } from "../address.service";

const addressService = new AddressService();

export const getUserAddressesController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user._id;

    // Get all addresses for the user
    const addresses = await addressService.getUserAddresses(userId);

    return res.status(200).json({
      message: "Addresses retrieved successfully",
      data: addresses,
      count: addresses.length,
    });
  } catch (error: any) {
    console.error("Error getting user addresses:", error);
    return res.status(500).json({
      message: error.message || "Failed to retrieve addresses",
    });
  }
};
