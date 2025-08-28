import { Request, Response } from "express";
import AdminService from "../admin.service";

export const listAdminAdsController = async (req: Request, res: Response) => {
  try {
    const service = new AdminService();
    const result = await service.listAds(req);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res
      .status(400)
      .json({
        success: false,
        message: error?.message || "Failed to list ads",
      });
  }
};
