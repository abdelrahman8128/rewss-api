import { Request, Response } from "express";
import { CategoryService } from "../service/category.service";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";


const listCategoryController = asyncHandler(async (req: Request, res: Response) => {
  try {
    const categoryService = new CategoryService();
    const categories = await categoryService.list(req);
    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to retrieve categories" });
  }
});

export { listCategoryController };