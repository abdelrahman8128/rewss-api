import { Request, Response } from "express";
import AdminService from "../admin.service";

export const changeAdStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const { status } = req.body as any;

    const service = new AdminService();
    const ad = await service.changeAdStatus(id, String(status));

    return res.status(200).json({ success: true, ad });
  } catch (error: any) {
    return res
      .status(400)
      .json({
        success: false,
        message: error?.message || "Failed to update status",
      });
  }
};
