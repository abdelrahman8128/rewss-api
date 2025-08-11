import asyncHandler from "express-async-handler";
import Brand, { IBrand } from "../../../Schema/Brand/brand.schema";
import { Types } from "mongoose";

export interface CreateBrandInput {
  name: string;
  country: string;
  logo: string;
}

export interface UpdateBrandInput {
  name?: string;
  country?: string;
  logo?: string;
}

export interface ListBrandsQuery {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
}

export interface PaginatedBrands {
  data: IBrand[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export class BrandService {
  async create(data: CreateBrandInput): Promise<IBrand | null> {
    const name = data.name.trim();
    const exists = await Brand.findOne({ name });
    if (exists) throw new Error("Brand already exists");

    return await Brand.create({
      name,
      //country: data.country.trim(),
      logo: "",
    });
  }

  async getById(id: string): Promise<IBrand | null> {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid brand id");
    return Brand.findById(id);
  }

  async list(query: ListBrandsQuery = {}): Promise<PaginatedBrands> {
    const { page = 1, limit = 20, search, country } = query;

    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }
    if (country) {
      filter.country = { $regex: `^${country.trim()}$`, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Brand.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Brand.countDocuments(filter),
    ]);

    return {
      data,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async update(id: string, data: UpdateBrandInput): Promise<IBrand | null> {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid brand id");
    const update: Record<string, any> = {};

    if (data.name) {
      const name = data.name.trim();
      const exists = await Brand.findOne({ name, _id: { $ne: id } });
      if (exists) throw new Error("Brand name already in use");
      update.name = name;
    }
    if (data.country) update.country = data.country.trim();
    if (data.logo) update.logo = data.logo.trim();

    if (!Object.keys(update).length) return Brand.findById(id);

    return Brand.findByIdAndUpdate(id, update, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid brand id");
    const res = await Brand.findByIdAndDelete(id);
    return !!res;
  }
}

const brandService = new BrandService();
export default brandService;
