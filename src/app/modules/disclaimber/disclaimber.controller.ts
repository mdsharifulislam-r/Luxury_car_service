import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DisclaimberService } from "./disclaimber.service";
import sendResponse from "../../../shared/sendResponse";

const createDisclaimber = catchAsync(
    async (req:Request,res:Response)=>{
        const data = await req.body
        const disclaimber = await DisclaimberService.createDisclaimberToDB(data)
        sendResponse(res,{
            success: true,
            statusCode: 201,
            message: "Disclaimber created successfully",
            data: disclaimber
        })
    }
)

const getdislcaimber= catchAsync(
    async (req:Request,res:Response)=>{
        const {type} = req.query
        const disclaimber = await DisclaimberService.getDislaiberByTypes(type as any)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Disclaimers retrieved successfully",
            data: disclaimber
        })
    }
)


export const DisclaimberController = {
    createDisclaimber,
    getdislcaimber
}