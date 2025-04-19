import { Model } from "mongoose";

export type ICategory = {
    name: string;
    image: string;
    status?: string;
    enum?: string
};

export type CategoryModel = Model<ICategory>;