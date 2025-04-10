import { model, Schema } from "mongoose";
import { IReview, ReviewModel } from "./review.interface";

const reviewSchema = new Schema<IReview,ReviewModel>({
    bookingId:{
        type:Schema.Types.ObjectId,
        ref:"Order",
        required:true,
    },
    customer:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    star:{
        type:Number,
        required:true,
    },
    comment:{
        type:String,
        required:false,
    },
    service:{
        type:Schema.Types.ObjectId,
        ref:"Service",
        required:true,
    },
}, { timestamps: true
})

reviewSchema.index({ service: 1 });

export const Review = model<IReview, ReviewModel>("Review", reviewSchema);