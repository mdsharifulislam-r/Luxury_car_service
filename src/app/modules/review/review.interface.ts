import { Model, Types } from "mongoose"

export type IReview = {
    customer:Types.ObjectId;
    star:number;
    comment?:string;
    bookingId:Types.ObjectId;
    service?:Types.ObjectId;
}

export type ReviewModel = Model<IReview>