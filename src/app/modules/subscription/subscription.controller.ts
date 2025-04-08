import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";
import { Types } from "mongoose";

const subscribePlan = catchAsync(
    async (req:Request,res:Response)=>{
        const user = req.user
        const {price_id}=req.body
        const url = await SubscriptionService.subscribePlanToUser(user,price_id)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscription successful",
            data: {
                url
            }
        })
    }
)

const subscribeWebHook = catchAsync(
    async (req:Request,res:Response)=>{
        const result = await SubscriptionService.subscribeWebHook(req)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscription successful",
            data: result
        })
    }
)

const createSubscription = catchAsync(
    async (req:Request,res:Response)=>{
        const result = await SubscriptionService.createSubscription(req.body)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscription successful",
            data: result
        })
    }
)

const getSubscriptions = catchAsync(
    async (req:Request,res:Response)=>{
        const result = await SubscriptionService.getSubscriptions()
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscriptions retrieved successfully",
            data: result
        })
    }
)

const updateSubscription = catchAsync(
    async (req:Request,res:Response)=>{
        const {id}=req.params
        const result = await SubscriptionService.updateSubscriptionToDB(req.body,id as any)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscription updated successfully",
            data: result
        })
    }
)

const deleteSubscription = catchAsync(
    async (req:Request,res:Response)=>{
        const {id}=req.params
        await SubscriptionService.deleteProduct(id as any)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscription deleted successfully"
        })
    })

const manageSubscriptions = catchAsync(
    async (req:Request,res:Response)=>{
        const {customer_id}=req.params
        const result = await SubscriptionService.manageSubscriptions(customer_id)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscriptions retrieved successfully",
            data: result
        })
    }
)
const expireAllUserSubscriptions = catchAsync(
    async (req:Request,res:Response)=>{
        await SubscriptionService.expireUserSubcription()
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "All user subscriptions expired successfully"
        })
    })

    
export const SubscriptionController = {
    subscribePlan,
    subscribeWebHook,
    createSubscription,
    getSubscriptions,
    updateSubscription,
    deleteSubscription,
    manageSubscriptions,
    expireAllUserSubscriptions
}