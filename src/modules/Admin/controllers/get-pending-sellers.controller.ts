import AdminService from "../admin.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const getPendingSellersController = asyncHandler(
  async (req: Request, res: Response) => {
    const adminService = new AdminService();

    try {
      const result = await adminService.getPendingSellers(req.query);

      res.status(StatusCodes.OK).json({
        message: "Pending sellers retrieved successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
    }
  }
);
