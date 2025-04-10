import Stripe from "stripe";
import { stripe } from "../app/modules/plan/plan.service";
import { Subscription } from "../app/modules/subscription/subscription.model";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { User } from "../app/modules/user/user.model";

export const handleSubscribeDeleted = async (data:Stripe.Subscription)=>{
    const subsciprtion = await stripe.subscriptions.retrieve(data.id)
    const existUserSubs = await Subscription.findOne({
        customerId:subsciprtion.customer,
        status:"active"
    })

    if(!existUserSubs){
        throw new ApiError(StatusCodes.NOT_FOUND,"Subscription not found")
    }

    await Subscription.findOneAndUpdate({_id:existUserSubs._id},{
        status:"expired"
    },{new:true})

    const user = await User.findOne({_id:existUserSubs.user})
    if(!user){
        throw new ApiError(StatusCodes.NOT_FOUND,"User not Found")
    }

    await User.findOneAndUpdate({_id:user._id},{
        subscriptions:null,
    })

}