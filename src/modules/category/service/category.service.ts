import Category from "../../../Schema/Category/Category.schema";
import {ICategory} from "../../../Schema/Category/Category.schema";


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

async updateCategory(req:any): Promise<ICategory | null> {

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
        throw new Error("Category not found");
    }

    if (req.body.name && req.body.name !== existingCategory.name) {
        const categoryWithSameName = await Category.findOne({ name: req.body.name });
        if (categoryWithSameName) {
            throw new Error("Category with this name already exists");
        }
    }

    return await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
}

  // async deleteCategory(id: string): Promise<ICategory | null> {
  //     return Category.findByIdAndDelete(id).exec();
  // }

  // async getAllCategories(): Promise<ICategory[]> {
  //     return Category.find().exec();
  // }
}
