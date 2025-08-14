import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { CategoryService } from "./../service/category.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const deleteCategoryController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const categoryService = new CategoryService();
    // Assuming you have a service to handle the deletion logic
    const category = await categoryService.delete(id);
    res
      .status(StatusCodes.OK)
      .json({ message: "Category deleted successfully", category });
  } catch (error:any) {

    res.status(500).json({ error: error.message || "Failed to delete category" });
  }
};

export { deleteCategoryController };
