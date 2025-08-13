import { CategoryService } from "./../service/category.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryService = new CategoryService();

  try {
    const createdCategory = await categoryService.create(req);
    if (!createdCategory) {
       res.status(StatusCodes.BAD_REQUEST).json({ message: "Category creation failed" });
    }
    res.status(StatusCodes.CREATED).json({
      message: "Category created successfully",
      data: createdCategory,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }
});
