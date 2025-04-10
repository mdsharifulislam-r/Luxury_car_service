import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PlanService   } from "./plan.service";
import sendResponse from "../../../shared/sendResponse";
import { Types } from "mongoose";

const subscribePlan = catchAsync(
    async (req:Request,res:Response)=>{
        const user = req.user
        const {price_id}=req.body
        const url = await PlanService.subscribePlanToUser(user,price_id)
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



const createPlan = catchAsync(
    async (req:Request,res:Response)=>{
        const result = await PlanService.createPlan(req.body)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscription successful",
            data: result
        })
    }
)

const getPlans = catchAsync(
    async (req:Request,res:Response)=>{
        const result = await PlanService.getPlans()
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscriptions retrieved successfully",
            data: result
        })
    }
)

const updatePlan = catchAsync(
    async (req:Request,res:Response)=>{
        const {id}=req.params
        const result = await PlanService.updatePlanToDB(req.body,id as any)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscription updated successfully",
            data: result
        })
    }
)

const deletePlan = catchAsync(
    async (req:Request,res:Response)=>{
        const {id}=req.params
        await PlanService.deleteProduct(id as any)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Subscription deleted successfully"
        })
    })

const managePlan = catchAsync(
    async (req:Request,res:Response)=>{
        const {customer_id}=req.params
        const result = await PlanService.managePlans(customer_id)
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
        await PlanService.expireUserSubcription()
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "All user subscriptions expired successfully"
        })
    })

    
export const PlanController = {
    subscribePlan,
    createPlan,
    getPlans,
    managePlan,
    deletePlan,
    updatePlan,
    expireAllUserSubscriptions
}