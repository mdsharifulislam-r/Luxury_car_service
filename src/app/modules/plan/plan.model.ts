import mongoose, { Schema, Types } from "mongoose";

import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiError";
import { USER_ROLES } from "../../../enums/user";
import { SUBSCRIPTION_PLAN_TYPE } from "../../../enums/subscriptionPlan";
import { IPlan, PlanModel } from "./plan.interface";

const planSchema = new Schema<IPlan,PlanModel>({
    priceId: { type: String, required: true },
    productId: { type: String, required: true },
    inclusions: [{ type: String }],
    Benefits: [{ type: String }],
    title: { type: String, required: true},
    description: { type: String, required: false},
    price: { type: Number, required: true},
    plan: { type: String,enum:Object.values(SUBSCRIPTION_PLAN_TYPE), required: true},
    status:{
        type:String,
        default:"active"
    }
    
},{
    timestamps: true,
})




export const Plan = mongoose.model<IPlan, PlanModel>("Plan", planSchema);