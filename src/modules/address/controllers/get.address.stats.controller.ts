import { Request, Response } from "express";
import { AddressService } from "../address.service";

const addressService = new AddressService();

export const getAddressStatsController = async (
  req: Request,
  res: Response
) => {
  try {
    const stats = await addressService.getAddressStats();

    return res.status(200).json({
      message: "Address statistics retrieved successfully",
      data: stats,
    });
  } catch (error: any) {
    console.error("Error getting address statistics:", error);
    return res.status(500).json({
      message: error.message || "Failed to retrieve address statistics",
    });
  }
};
