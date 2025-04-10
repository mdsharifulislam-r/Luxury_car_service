import { JwtPayload } from "jsonwebtoken";
import { IService } from "./service.interface";
import { Service } from "./service.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { USER_ROLES } from "../../../enums/user";
import unlinkFile from "../../../shared/unlinkFile";
import { ReviewService } from "../review/review.service";

const createServiceToDB = async (user:JwtPayload,data:Partial<IService>)=>{
    const newService = new Service({
        provider: user.id,
        title: data.title,
        price: data.price,
        description: data.description||"",
        category: data.category,
        car_model: data.car_model,
        image: data.image
    });
    return await newService.save();
}

const getAllServicesFromDB = async (query:Record<string,any>)=>{
    const result = new QueryBuilder(Service.find({status:{$ne:"delete"}}),query).paginate().filter().sort()
    const paginationInfo = await result.getPaginationInfo()
    const services = await result.modelQuery.populate(['provider'],['name','image']).lean()
    const newService = await Promise.all(services.map(async (service)=>{
        return {
            ...service,
            rating:(await ReviewService.getReviewFromDB(service._id as any)).rating||0
        }
    }))
    return {
        services:newService,
        paginationInfo
    }

}

const getServiceByIdFromDB = async (id:Types.ObjectId)=>{
    const service = await Service.findOne({_id:id,status:"active"}).populate(['provider'],['name','image']).lean()
    if(!service){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found')
    }
    return service
}

const updateServiceByIdToDB = async (id:Types.ObjectId,data:Partial<IService>)=>{
    const service = await Service.findOne({_id:id})
    if(!service){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found')
    }
    if(data.image){
        unlinkFile(service.image)
    }
    const updatedService = await Service.findByIdAndUpdate(id, data, {new: true})
    if(!updatedService){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found')
    }
    return updatedService

}

const deleteServiceByIdFromDB = async (id:Types.ObjectId,user:JwtPayload)=>{
    if(user.role==USER_ROLES.ADMIN){
        return await Service.findByIdAndUpdate(id,{status:"delete"})
    }
    const deletedService = await Service.findOneAndUpdate({_id:id,provider:user.id},{status:"delete"})
    if(!deletedService){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found')
    }
    return deletedService
}

export const ServiceService = {
    createServiceToDB,
    getAllServicesFromDB,
    getServiceByIdFromDB,
    updateServiceByIdToDB,
    deleteServiceByIdFromDB
}