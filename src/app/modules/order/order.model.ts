import { model, Schema } from "mongoose";
import { IOrder, OrderModel } from "./order.interface";
import { ORDER_STATUS } from "../../../enums/orderStatus";

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
    }


}, { timestamps: true }); 

export const Order = model<IOrder, OrderModel>("Order", orderSchema);