import { Request, Response } from "express";
import { AddressService } from "../address.service";

const addressService = new AddressService();

export const setDefaultAddressController = async (
  req: Request,
  res: Response
) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    // Set the address as default
    const address = await addressService.setDefaultAddress(addressId, userId);

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    return res.status(200).json({
      message: "Default address set successfully",
      data: address,
    });
  } catch (error: any) {
    console.error("Error setting default address:", error);
    return res.status(400).json({
      message: error.message || "Failed to set default address",
    });
  }
};
