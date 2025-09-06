import { Request, Response } from "express";
import { AddressService } from "../address.service";
import { CreateAddressDto } from "../DTO/address.dto";

const addressService = new AddressService();

export const createAddressController = async (req: Request, res: Response) => {
  try {
    const addressData = req.body as CreateAddressDto;
    const userId = req.user._id;

    // Create the address
    const address = await addressService.createAddress(userId, addressData);

    return res.status(201).json({
      message: "Address created successfully",
      data: address,
    });
  } catch (error: any) {
    console.error("Error creating address:", error);
    return res.status(400).json({
      message: error.message || "Failed to create address",
    });
  }
};
