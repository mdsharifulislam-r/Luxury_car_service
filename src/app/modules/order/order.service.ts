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
import { stripe } from "../plan/plan.service";
import { IUser } from "../user/user.interface";

const createOrderToDB = async (user:JwtPayload,order: Partial<IOrder>) => {
    const service = await Service.findById(order.service).lean()
    if (!service) {
        throw new Error("Service not found");
    }
    const provider = service.provider;
    const booking_fee = Number((service.price * (5/100)).toFixed(2))
    const total_amount = Number((service.price + booking_fee).toFixed(2))
    const orderId = sizableToken(10)
    const newOrder = {
        ...order,
        provider,
        booking_fee,
        total_amount,
        customer: user.id,
        orderId,
    };
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: service.title,
                        description: service.description,
                    },
                    unit_amount: total_amount * 100,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `http://local/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://local/success?session_id={CHECKOUT_SESSION_ID}`,
        metadata:{
            orderData:JSON.stringify(newOrder),
        },
        client_reference_id: orderId,
        customer_email: user.email,
    })
    if (!session) {
        throw new ApiError(400,"Failed to create session")
    }
    
    

    return session.url ;
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
    if((!userInfo?.accountInfo?.stripeAccountId) && (status === ORDER_STATUS.IN_PROGRESS)){
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
    if(status == ORDER_STATUS.REJECTED){
        const refund = await stripe.refunds.create({
            amount: order?.total_amount! * 100,
            payment_intent: order?.paymentId,
        })
        const k =await Order.findOneAndUpdate({_id:orderId,provider:user.id}, { status,paymentId:null}, { new: true })
        sendNotifications({
            title: `Booking Rejected!`,
            read:false,
            text:`${userInfo?.name} has rejected your order ${order?.orderId}. Refund has been initiated`,
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

const giveReminderToUsers = async () => {

    const orders = await Order.find({
      status: ORDER_STATUS.IN_PROGRESS,
    }).populate("customer")

    orders.forEach(order => {
        const { customer, schedule,date } = order as any;
        const endDate:any = new Date(schedule?.end_date||date);
      const days = timeHelper.timeAgo(endDate)
      if(days === "1 days ago"){
        sendNotifications({
            title: `Reminder`,
            read:false,
            text:`${customer.name} tomorow is your service at ${timeHelper.extractDateAndTime(schedule?.end_date).time}`,
            direction:"service",
            sender:order?.provider,
            receiver:order?.customer._id,
            link:`/book/${order?._id}`,
        })
      }
      
        // Send reminder (e.g., email, SMS, socket)
      });
      
      
    
  };

const completeOrder = async (orderId:Types.ObjectId,user:JwtPayload) => {
    
    const order = await Order.findOne({_id:orderId,customer:user.id}).populate(['customer',"provider"]).lean()

    if(!order){
        throw new ApiError(400,"Order not found")
    }
    
    
    if(order.status !== ORDER_STATUS.IN_PROGRESS){
        throw new ApiError(400,"Order not in progress")
    }
    const temp:any =order.provider
    const provider:IUser = temp
    
    const transfer = await stripe.transfers.create({
        amount: 4000,
        currency: 'usd',
        destination:provider.accountInfo?.stripeAccountId!,
      });
      
    if(!transfer){
        throw new ApiError(400,"Transfer failed")
    }
    const k = await Order.findOneAndUpdate({_id:orderId,customer:user.id}, { status: ORDER_STATUS.COMPLETED }, { new: true })
    sendNotifications({
        title: `Booking Completed!`,
        read:false,
        text:`${provider.name} has completed your order ${k?.orderId}`,
        direction:"service",
        sender:order?.provider._id,
        receiver:order?.customer._id,
    })
    const customer = order.customer as any as IUser
    sendNotifications({
        title: `Payment Completed!`,
        read:false,
        text:`${customer.name} has paid ${k?.total_amount} for your order ${k?.orderId}`,
        direction:"service",
        sender:order?.customer._id,
        receiver:order?.provider._id,
    })
    return transfer.destination
  }
  
export const OrderService = {
    createOrderToDB,
    getOrderById,
    getOrdersByUserId,
    acceptOrRejectOrderInDB,
    giveReminderToUsers,
    completeOrder,
}