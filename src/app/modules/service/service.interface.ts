import { Model, Types } from "mongoose"
import { SERVICE_CATEGORY } from "../../../enums/serviceCatagories";

export type IService = {
    provider:Types.ObjectId;
    title:string;
    price:number;
    description?:string;
    category: string;
    car_model:string;
    image:string;
    status?:string
}

export type ServiceModel = {
} & Model<IService>;