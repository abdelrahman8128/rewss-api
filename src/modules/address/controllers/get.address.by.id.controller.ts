import { Request, Response } from "express";
import { AddressService } from "../address.service";

const addressService = new AddressService();

export const getAddressByIdController = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    // Get the specific address
    const address = await addressService.getAddressById(addressId, userId);

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    return res.status(200).json({
      message: "Address retrieved successfully",
      data: address,
    });
  } catch (error: any) {
    console.error("Error getting address by ID:", error);
    return res.status(500).json({
      message: error.message || "Failed to retrieve address",
    });
  }
};
