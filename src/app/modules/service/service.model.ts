import { model, Schema } from "mongoose";
import { IService, ServiceModel } from "./service.interface";
import { SERVICE_CATEGORY } from "../../../enums/serviceCatagories";

const serviceSchema = new Schema<IService,ServiceModel>({
    car_model:{
        type: String,
        required: true
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        enum: Object.values(SERVICE_CATEGORY),
        required: true
    },
    image: {
        type: String,
        required: true
    }
},{
    timestamps: true,
})

export const Service = model<IService, ServiceModel>("Service", serviceSchema);