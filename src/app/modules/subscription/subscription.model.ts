import mongoose, { Schema, Types } from "mongoose";
import { ISubscription, SubscriptionModel } from "./subscription.interface";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiError";
import { USER_ROLES } from "../../../enums/user";
import { SUBSCRIPTION_PLAN_TYPE } from "../../../enums/subscriptionPlan";

const subscriptionSchema = new Schema<ISubscription,SubscriptionModel>({
    priceId: { type: String, required: true },
    productId: { type: String, required: true },
    inclusions: [{ type: String }],
    Benefits: [{ type: String }],
    title: { type: String, required: true},
    description: { type: String, required: false},
    price: { type: Number, required: true},
    plan: { type: String,enum:Object.values(SUBSCRIPTION_PLAN_TYPE), required: true},
    
},{
    timestamps: true,
})




export const Subscription = mongoose.model<ISubscription, SubscriptionModel>("Subscription", subscriptionSchema);