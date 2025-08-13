import { CategoryService } from "./../service/category.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";


export const updateCategoryController =asyncHandler( async (req: Request, res: Response) => {
  try {
    const categoryService = new CategoryService();

    const updatedCategory = await categoryService.updateCategory(req);
    res.status(200).json({ message: "Category updated successfully", data: updatedCategory });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});