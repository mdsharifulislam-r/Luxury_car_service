import { model, Schema } from "mongoose";
import { IOrder, OrderModel } from "./order.interface";
import { ORDER_STATUS } from "../../../enums/orderStatus";
import { User } from "../user/user.model";
import { sendNotifications } from "../../../helpers/notificationHelper";
import { Service } from "../service/service.model";
import { log } from "winston";

const orderSchema = new Schema<IOrder,OrderModel>({
    customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    service: {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    booking_fee: {
        type: Number,
        required: true,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default:ORDER_STATUS.PENDING,
    },
    schedule:{
        start_date:{
            type:String
        },
        end_date:{
            type:String
        },
    },
    date: {
        type: Date,
        required: false,
    },
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    paymentId: {
        type: String,
        required: false,
    },

}, { timestamps: true }); 

orderSchema.statics.setPaymentIntent= async(data:any,paymentid:string)=> {
    const parseData = JSON.parse(data)
    const order = await Order.create({
        ...parseData,
        paymentId:paymentid,
    })
    
    if(!order){
        throw new Error("Order not found")
    }
    const service = await Service.findById(order.service).populate("provider")
    const customer_details = await User.findById(order.customer)
       sendNotifications({
            title: `You have a new order from ${customer_details?.name}`,
            read:false,
            text:`${customer_details?.name} has booked ${service?.title} service at ${order.date}`,
            direction:"service",
            sender:order.customer,
            receiver:order.provider,
            link:`/book/${order._id}`,
        })
    sendNotifications({
        title: `Booking Confirmed!`,
        read:false,
        text:`you are booked ${service?.title} service at ${order.date}`,
        direction:"service",
        sender:order.customer,
        receiver:order.customer,
        link:`/book/${order._id}`,
    })

}
export const Order = model<IOrder, OrderModel>("Order", orderSchema);