import Category from "../../../Schema/Category/Category.schema";
import { ICategory } from "../../../Schema/Category/Category.schema";

export interface ICategoryList {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: ICategory[];
}

export class CategoryService {
  async create(req: any): Promise<ICategory | null> {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      throw new Error("Category already exists");
    }

    return await Category.create({
      name: req.body.name,
      description: req.body.description,
    });
  }

  // async getCategoryById(id: string): Promise<ICategory | null> {
  //     return Category.findById(id).exec();
  // }

  async update(req: any): Promise<ICategory | null> {
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    if (req.body.name && req.body.name !== existingCategory.name) {
      const categoryWithSameName = await Category.findOne({
        name: req.body.name,
      });
      if (categoryWithSameName) {
        throw new Error("Category with this name already exists");
      }
    }

    return await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
  }

  async delete(id: string): Promise<ICategory | null> {
    const deletedCategory = await Category.findByIdAndDelete(id).exec();
    if (!deletedCategory) {
      throw new Error("Category not found");
    }
    return deletedCategory;
  }

  async list(req: any): Promise<ICategoryList> {
    const { page = 1, limit = 20, search } = req.query;

    // Ensure numeric values for pagination to satisfy MongoDB $skip/$limit
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);

    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const skip = (pageNum - 1) * limitNum;

    const [agg] = await Category.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          meta: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limitNum }],
        },
      },
    ]);

    const data = agg?.data ?? [];
    const total = agg?.meta?.[0]?.total ?? 0;

    return {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
      data,
    };
  }
}
