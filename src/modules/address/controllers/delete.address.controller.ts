import { Request, Response } from "express";
import { AddressService } from "../address.service";

const addressService = new AddressService();

export const deleteAddressController = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    // Delete the address
    const deleted = await addressService.deleteAddress(addressId, userId);

    if (!deleted) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    return res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return res.status(500).json({
      message: error.message || "Failed to delete address",
    });
  }
};
