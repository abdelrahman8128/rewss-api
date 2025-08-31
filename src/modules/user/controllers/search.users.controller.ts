import { Request, Response } from "express";
import { UserService } from "../user.service";

const userService = new UserService();

export const searchUsersController = async (req: Request, res: Response) => {
  try {
    const { search, status, role, page, limit } = req.query;

    const result = await userService.searchUsers({
      search: search as string,
      status: status as string,
      role: role as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      message: "Users search completed successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error searching users:", error);
    res.status(400).json({
      message: error.message || "Failed to search users",
    });
  }
};
