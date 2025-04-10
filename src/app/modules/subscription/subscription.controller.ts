import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";

const expireSubscriptions = catchAsync(
    async (req:Request,res:Response)=>{
        const result = await SubscriptionService.expireUserSubcription()
        sendResponse(res,{
            statusCode:200,
            message:"Subscriptions Suspended",
            success:true,
        })
    }
)

export const SubscriptionController = {
    expireSubscriptions
}