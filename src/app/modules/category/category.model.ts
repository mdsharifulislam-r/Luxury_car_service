import mongoose from "mongoose";
import { CategoryModel, ICategory } from "./category.interface";

const categorySchema = new mongoose.Schema<ICategory,CategoryModel>({
    name: { type: String, required: true,unique:true},
    image: { type: String, required: true },
    status: { type: String, enum: ["active", "delete"], default: "active" },
    enum:{
        type: String,}
}, {
    timestamps: true
})
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.pre('save', async function (next) {
    this.enum=this.name.toUpperCase().replace(/\s+/g, "_");
    next();
})
export const Category = mongoose.model<ICategory, CategoryModel>('Category', categorySchema);