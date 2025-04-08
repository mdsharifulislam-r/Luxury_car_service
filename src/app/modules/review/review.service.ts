import { JwtPayload } from "jsonwebtoken";
import { IReview } from "./review.interface";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { Review } from "./review.model";
import { Types } from "mongoose";
import { User } from "../user/user.model";
import { Service } from "../service/service.model";
import { sendNotifications } from "../../../helpers/notificationHelper";
import { SERVICE_CATEGORY } from "../../../enums/serviceCatagories";
import { Order } from "../order/order.model";
import { ORDER_STATUS } from "../../../enums/orderStatus";

const giveReviewToDB = async (user:JwtPayload,payload:Partial<IReview>)=>{
    const booking:any = await Order.findOne({_id:payload.bookingId}).populate("service").lean()
    if (!booking) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Service not found');
    }
    if(booking.status !== ORDER_STATUS.COMPLETED){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'You can not review this service');
    }
    const review = await Review.create({
        ...payload,
        customer:user.id,
        service:booking.service._id,
    })
    if (!review) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create review');
    }
    const customer = await User.findById(user.id)
    sendNotifications({
        title: `You have a new review from ${customer?.name}`,
        read:false,
        text:`${customer?.name} has reviewed ${booking.orderId} `,
        direction:"review",
        sender:user.id,
        receiver:booking.service.provider,
        link:`/review/${review._id}`,
    })
    return review
}

const getReviewFromDB = async (service:Types.ObjectId)=>{
    const reviews = await Review.find({service}).populate("customer","name email")
    if (!reviews) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get review');
    }
    let rating = 0
    reviews.forEach((review)=>{
        rating += review.star
    })
    rating = Number((rating/reviews.length).toFixed(1))
    return {
        reviews,
        rating
    }

}

export const ReviewService = {
    giveReviewToDB,
    getReviewFromDB
}