import Model from "../../../Schema/Model/model.schema";
import { Types } from "mongoose";
import Brand from "../../../Schema/Brand/brand.schema";


export interface IModelList {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: any[]; // Adjust type as needed
}

export class ModelService {
  async create(req: any): Promise<any | null> {
    const { name, brand } = req.body;

    this.validateBrand(brand); // Validate the brand ID
    // Create the model
    const model = await Model.create({
      name,
      brand, // Store the brand
    });

    // Populate after creating the document
    return model.populate("brand", "name");
  }

  async getById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid model id");

    return Model.findById(id).populate("brand", "name");
  }

  async list(req:any): Promise<IModelList> {   
    const { page = 1, limit = 20, search } = req.query;
    
    // Ensure numeric values for pagination to satisfy MongoDB $skip/$limit
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;
    
    const filter: any = {};
    if (search) {
        filter.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }
    
    const models = await Model.aggregate([
      { $match: filter },
      { $skip: skip },
      { $limit: limitNum },
      {
        $lookup: {
          from: "brands", // Collection name for brands
          localField: "brand",
          foreignField: "_id",
          as: "brandInfo"
        }
      },
      { $unwind: "$brandInfo" },
      {
        $project: {
          _id: 1,
          name: 1,
          brand: {
            _id: "$brandInfo._id",
            name: "$brandInfo.name",
            logo: "$brandInfo.logo" // Include logo if needed
          },
          // Include other fields you want to return
        }
      }
    ]);
    
    return {
      page: pageNum,
      limit: limitNum,
      total: models.length,
      pages: Math.ceil(models.length / limitNum),
      data: models
    };
    }

    async deleteModel(req:any): Promise<boolean> {
      // Validate the ID
      if (!req.params.id) throw new Error("Model ID is required");
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) throw new Error("Invalid model id");
      const res = await Model.findByIdAndDelete(id);
      return !!res;
    }

    async update(req: any): Promise<any | null> {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) throw new Error("Invalid model id");

      const { name, brand } = req.body;
      
      if (brand) {
        await this.validateBrand(brand);

      }

      const updatedModel = await Model.findByIdAndUpdate(id, { name, brand }, { new: true }).populate("brand", "name");
      if (!updatedModel) throw new Error("Model not found");
      return updatedModel;
    }


    async listModelByBrand(req: any): Promise<IModelList> {
      const { brandId } = req.params;
      if (!Types.ObjectId.isValid(brandId)) throw new Error("Invalid brand id");

      const { page = 1, limit = 20, search } = req.query;
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.max(1, Number(limit) || 20);
      const skip = (pageNum - 1) * limitNum;

      const filter: any = { brand: brandId };
      if (search) {
      filter.name = { $regex: search, $options: "i" };
      }

      const total = await Model.countDocuments(filter);
      const models = await Model.find(filter)
      .populate("brand", "name")
      .skip(skip)
      .limit(limitNum);

      return {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      data: models
      };
    }


    private async validateBrand(brandId: string): Promise<void> {
      if (!Types.ObjectId.isValid(brandId)) throw new Error("Invalid brand id");
      const brandExists = await Brand.exists({ _id: brandId });
      if (!brandExists) throw new Error("Brand not found");
    }



}
