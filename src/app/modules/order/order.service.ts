import { JwtPayload } from "jsonwebtoken";
import { sendNotifications } from "../../../helpers/notificationHelper";
import { Service } from "../service/service.model";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";
import cryptoToken, { sizableToken } from "../../../util/cryptoToken";
import mongoose, { Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import { User } from "../user/user.model";
import { ORDER_STATUS } from "../../../enums/orderStatus";
import ApiError from "../../../errors/ApiError";
import { timeHelper } from "../../../helpers/timeHelper";

const createOrderToDB = async (user:JwtPayload,order: Partial<IOrder>): Promise<IOrder> => {
    const service = await Service.findById(order.service).lean()
    if (!service) {
        throw new Error("Service not found");
    }
    const provider = service.provider;
    const booking_fee = Number((service.price * (5/100)).toFixed(2))
    const total_amount = Number((service.price + booking_fee).toFixed(2))
    const orderId = sizableToken(10)
    const newOrder = await Order.create({
        ...order,
        provider,
        booking_fee,
        total_amount,
        customer: user.id,
        orderId,
    });
    const customer_details = await User.findById(newOrder.customer)
   await sendNotifications({
        title: `You have a new order from ${customer_details?.name}`,
        read:false,
        text:`${customer_details?.name} has booked ${service.title} service at ${order.date}`,
        direction:"service",
        sender:newOrder.customer,
        receiver:provider,
        link:`/book/${newOrder._id}`,
    })
    return newOrder;
}

const getOrderById = async (id:Types.ObjectId): Promise<IOrder> => {
    const order = await Order.findById(id).populate([
        {
            path: "customer",
            select: "name email phone image location",
        },
        {
            path: "provider",
            select: "name email phone image location accountInfo",
        },
        {
            path: "service",
            select: "title description price image car_model price",
        }
    ]).lean()
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
}



const getOrdersByUserId = async (user: JwtPayload,query:Record<string,any>) => {
    const result = new QueryBuilder(Order.find({ $or:[
        { customer: user.id },
        { provider: user.id }
    ]}),query).paginate().sort().filter()
    const paginatedResult = await result.getPaginationInfo()
    const orders = await result.modelQuery.populate([
        {
            path: "customer",
            select: "name email phone image location",
        },
        {
            path: "provider",
            select: "name email phone image location accountInfo",
        },
        {
            path: "service",
            select: "title description price image car_model price",
        }
    ])
    .lean()

    const formatOrders = orders.map((order:any) => {
        const timeAndDate = timeHelper.extractDateAndTime(order.date)
        return {
            ...order,
            date: timeAndDate.date,
            time: timeAndDate.time,
            status: order.status,
            booking_fee: order.booking_fee,
            total_amount: order.total_amount,
            createdAt: order.createdAt.toDateString(),
        };
    })
    return {
        orders:formatOrders,
        pagination:paginatedResult
    }
};

const acceptOrRejectOrderInDB = async (user: JwtPayload, orderId: Types.ObjectId, status: ORDER_STATUS)=> {
    const userInfo = await User.findById(user.id).lean()
    if(!userInfo?.accountInfo?.stripeAccountId && status === ORDER_STATUS.IN_PROGRESS){
        throw new ApiError(400,"You need to connect your stripe account to accept this order")
    }
    if(status == ORDER_STATUS.COMPLETED){
        throw new ApiError(400,"You cannot complete this order")
    }

    const order =await Order.findOneAndUpdate({_id:orderId,provider:user.id}, { status }, { new: true })
    if(status == ORDER_STATUS.IN_PROGRESS){
        sendNotifications({
            title: `Booking Confirmed!`,
            read:false,
            text:`${userInfo?.name} has accepted your order ${order?.orderId}`,
            direction:"service",
            sender:user.id,
            receiver:order?.customer,
            link:`/book/${order?._id}`,
        })
    }
    if(!order){
        throw new ApiError(400,"Order not found")
    }
    return order
}

const giveReminderToUsers = async ()=>{
    const orders = await Order.find({
        $and:[
            { status: ORDER_STATUS.IN_PROGRESS },
            {
                $or: [

                    { "schedule.start_date": { $lte: new Date() } },
                    { "schedule.end_date": { $lte: new Date() } },
                ],
            },
            
            { createdAt: { $gte: new Date() } },
        ]
    })
    console.log(orders);
    
}
export const OrderService = {
    createOrderToDB,
    getOrderById,
    getOrdersByUserId,
    acceptOrRejectOrderInDB,
    giveReminderToUsers
}