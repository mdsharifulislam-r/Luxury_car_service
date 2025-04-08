import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { getSingleFilePath } from "../../../shared/getFilePath";
import { ServiceService } from "./service.service";
import sendResponse from "../../../shared/sendResponse";

const createService = catchAsync(
    async (req:Request,res:Response)=>{
        const files = req.files
        const image = getSingleFilePath(files,'image')
        
        const data = {...req.body, image}
        const user = req.user
        const result = await ServiceService.createServiceToDB(user,data)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Service created successfully",
            data: result
        })
    }
)

const getServices = catchAsync(
    async (req:Request,res:Response)=>{
        const query = req.query
        const services = await ServiceService.getAllServicesFromDB(query)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Services retrieved successfully",
            data: services
        })
    }
)

const getServiceById = catchAsync(
    async (req:Request,res:Response)=>{
        const {id}=req.params
        const service = await ServiceService.getServiceByIdFromDB(id as any)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Service retrieved successfully",
            data: service
        })
    })
    
const updateService = catchAsync(
    async (req:Request,res:Response)=>{
        const {id}=req.params
        const files = req.files
        const image = getSingleFilePath(files,'image')
        const data = {...req.body, image}
        const result = await ServiceService.updateServiceByIdToDB(id as any,data)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Service updated successfully",
            data: result
        })
    })

const deleteService = catchAsync(
    async (req:Request,res:Response)=>{
        const {id}=req.params
        const user = req.user
        const result = await ServiceService.deleteServiceByIdFromDB(id as any,user)
        sendResponse(res,{
            success: true,
            statusCode: 200,
            message: "Service deleted successfully",
            data: result
        })
    })


export const ServiceController = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
}