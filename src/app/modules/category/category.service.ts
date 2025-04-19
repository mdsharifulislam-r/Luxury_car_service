import unlinkFile from "../../../shared/unlinkFile";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";

const saveCategoryToDB = async (data: ICategory) => {
    const category = await Category.create(data);
    return category;
}

const getAllCategoryFromDB = async () => {
    const categories = await Category.find({status:{$ne:"delete"}});
    return categories;
}

const updateCategoryToDB = async (id: string, data: Partial<ICategory>) => {
    const existCategory = await Category.findOne({ _id: id });
    if (!existCategory) {    
        throw new Error('Category not found');
    }
    if (data.image) {
        unlinkFile(existCategory.image)
    }
    const category = await Category.findOneAndUpdate({ _id: id }, data, { new: true })
    return category;
}

export const CategoryService = {
    saveCategoryToDB,
    getAllCategoryFromDB,
    updateCategoryToDB
}