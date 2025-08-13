import Category from "../../../Schema/Category/Category.schema";

export class CategoryService {
  async create(req: any): Promise<void> {
    

    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      throw new Error("Category already exists");
    }
    const category = new Category({
      name: req.body.name,
    });
    category.save();
  }

  // async getCategoryById(id: string): Promise<ICategory | null> {
  //     return Category.findById(id).exec();
  // }

async updateCategory(id: string, data: any): Promise<void> {
    
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
        throw new Error("Category not found");
    }
    
    if (data.name && data.name !== existingCategory.name) {
        const categoryWithSameName = await Category.findOne({ name: data.name });
        if (categoryWithSameName) {
            throw new Error("Category with this name already exists");
        }
    }
    
    await Category.findByIdAndUpdate(id, data, { new: true });
}

  // async deleteCategory(id: string): Promise<ICategory | null> {
  //     return Category.findByIdAndDelete(id).exec();
  // }

  // async getAllCategories(): Promise<ICategory[]> {
  //     return Category.find().exec();
  // }
}
