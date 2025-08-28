import { Request, Response } from "express";
import AdService from "../ad.service";

export const listAdController = async (req: Request, res: Response) => {
  try {
    const adService = new AdService();
    const result = await adService.list(req);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message: error?.message || "Failed to list ads",
      });
  }
};
