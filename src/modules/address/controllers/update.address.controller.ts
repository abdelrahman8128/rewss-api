import { Request, Response } from "express";
import { AddressService } from "../address.service";
import { UpdateAddressDto } from "../DTO/address.dto";

const addressService = new AddressService();

export const updateAddressController = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const updateData = req.body as UpdateAddressDto;
    const userId = req.user._id;

    // Update the address
    const address = await addressService.updateAddress(
      addressId,
      userId,
      updateData
    );

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    return res.status(200).json({
      message: "Address updated successfully",
      data: address,
    });
  } catch (error: any) {
    console.error("Error updating address:", error);
    return res.status(400).json({
      message: error.message || "Failed to update address",
    });
  }
};
