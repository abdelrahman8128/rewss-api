import { Request, Response } from "express";
import AdminService from "../admin.service";

export const createSellerController = async (req: Request, res: Response) => {
  try {
    const service = new AdminService();
    const { newSeller, plainPassword } = await service.createSeller(req);

    return res.status(201).json({
      success: true,
      message: "Seller account created successfully",
      seller: newSeller,
      password: plainPassword,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: error?.message || "Internal error" });
  }
};
