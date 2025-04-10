import Stripe from "stripe";
import { stripe } from "../app/modules/plan/plan.service";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { User } from "../app/modules/user/user.model";
import { Plan } from "../app/modules/plan/plan.model";
import { Subscription } from "../app/modules/subscription/subscription.model";

export const handleSubcriptionCreated = async (data:any)=>{
    const subscription = await stripe.subscriptions.retrieve(data.id) as any
    const customer = await stripe.customers.retrieve(data.customer as string) as Stripe.Customer
    const priceId = subscription.items.data[0]?.price?.id
    const invoice =await stripe.invoices.retrieve(subscription.latest_invoice as string) as any
    const paymentIntent = invoice?.payment_intent;
    const amountPaid = invoice?.total / 100;
    const productId = subscription.items.data[0]?.price?.product as string;
    if(!customer.email){
        throw new ApiError(StatusCodes.NOT_FOUND,'Customer not found')
    }

    const existingUser= await User.findOne({email:customer.email})
    const plan_id = (await Plan.findOne({productId:productId}))?._id
    
    const currentPeriodStart = new Date(data.current_period_start * 1000).toISOString(); // Convert to human-readable date
    const currentPeriodEnd = new Date(data.current_period_end * 1000).toISOString();

    const peyload = {
        user:existingUser?._id,
        currentPeriodEnd,
        currentPeriodStart,
        customerId:customer.id,
        plan:plan_id,
        price:amountPaid,
        subscriptionId:subscription.id,
        trxId:priceId,

    }
    
    

    const isExistingSubScription = await Subscription.findOne({user:existingUser?._id})
    if(isExistingSubScription){
        const sub = await Subscription.findOneAndUpdate({user:existingUser?._id},{
            ...peyload,
            status:"active"

        },{new:true})
        await User.findByIdAndUpdate(existingUser?._id,{subscriptions:sub?._id},{new:true})
        return
    }

   const sub = await Subscription.create(peyload)
   await User.findByIdAndUpdate(existingUser?._id,{subscriptions:sub._id},{new:true})




}

