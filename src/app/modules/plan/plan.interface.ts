import { Model, Types } from "mongoose";
import { SUBSCRIPTION_PLAN_TYPE } from "../../../enums/subscriptionPlan";

export type IPlan={
    title:string;
    description?:string;
    price:number;
    priceId:string;
    productId:string;
    inclusions:string[];
    Benefits:string[];
    plan:SUBSCRIPTION_PLAN_TYPE;
    status:string
}

export type PlanModel={
}&Model<IPlan>