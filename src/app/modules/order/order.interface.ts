import { Model, Types } from "mongoose"
import { ORDER_STATUS } from "../../../enums/orderStatus";

export type IOrder = {
    customer:Types.ObjectId;
    provider:Types.ObjectId;
    service:Types.ObjectId;
    booking_fee:number;
    total_amount:number;
    location:string;
    date:Date;
    schedule?:{
        start_date:Date;
        end_date:Date
    };
    status:ORDER_STATUS,
    orderId:string;
    paymentId?:string;
    assistant_number:number,
    app_fee?:number

}

export type OrderModel= Model<IOrder>&{
    setPaymentIntent:(data:any,payment_id:string)=>Promise<void>;
}