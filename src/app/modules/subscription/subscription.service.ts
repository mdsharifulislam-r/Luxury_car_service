import Stripe from "stripe";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { Request } from "express";
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import { Subscription } from "./subscription.model";
import { ISubscription } from "./subscription.interface";
import { Types } from "mongoose";

export const stripe = new Stripe(config.stripe.stripe_secret!)

const createSubscription = async (data:Partial<ISubscription>)=>{
  const product = await stripe.products.create({
    name: data.title!,
    description: data.description||"",
  })
  if (!product) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product');
  }
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount:data.price && data.price*100!,
    recurring:{
      interval:data.plan!,
    },
    tax_behavior:"inclusive"
  })
  if (!price) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create price');
  }
  const subscription = await Subscription.create({
    price: data.price,
    plan: data.plan,
    priceId:price.id,
    Benefits:data.Benefits,
    title: data.title,
    description: data.description,
    inclusions:data.inclusions,
    productId:product.id
  })

  return subscription
}

const subscribePlanToUser = async (user:JwtPayload,priceId:string)=>{
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price:priceId,
            quantity: 1,
        }],
        mode: 'subscription',
        success_url: `http://localhost:3000`,
        cancel_url: `http://localhost:3000`,
        metadata:{
          user_id: user.id,
          price:priceId
        },
        customer_email: user.email
    })

    

    if(session.url){
        return session.url
    }
    throw new ApiError(StatusCodes.BAD_REQUEST,'Subscription unsuccessful')
}

const updateSubscriptionToDB = async(data:Partial<ISubscription>,id:Types.ObjectId)=>{
  const subscription = await Subscription.findByIdAndUpdate(id, data, {new: true})
  if(!subscription){
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription not found')
  }
  if(data.title || data.description){
    const product = await stripe.products.update(subscription.productId, {
      name: data.title || subscription.title ,
      description: data.description||subscription.description,
      
    })
  }
}

const deleteProduct = async (product_id:Types.ObjectId)=>{
  const subsciprtion = await Subscription.findById(product_id)
  if(!subsciprtion){
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription not found')
  }
  const prices = await stripe.prices.list({product:subsciprtion.productId})
  
  if(prices.data.length){
    for(let price of prices.data){
      await stripe.prices.update(price.id,{active:false})
    }
  }
  try {
    const product = await stripe.products.del(subsciprtion.productId)
  } catch (error) {
    await stripe.products.update(subsciprtion.productId,{
      active:false,
    })
  }
  return Subscription.findByIdAndDelete(product_id)
}

const getSubscriptions = async ()=>{
  const subscriptions = await Subscription.find({})
  if(!subscriptions){
    throw new ApiError(StatusCodes.NOT_FOUND, 'No subscriptions found')
  }
  return subscriptions

}

const manageSubscriptions = async (customerId: string)=>{
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'http://localhost:3000/dashboard/subscription', // Your return URL after redirection
  })
  if(session.url){
    return session.url
  }
  throw new ApiError(StatusCodes.BAD_REQUEST,'Subscription portal unsuccessful')
}

let start =0
let end = 0

const subscribeWebHook = async (req:Request)=>{

    
  let event: any

  // Verify the event signature
  try {
      
      // Use raw request body for verification
      event = stripe.webhooks.constructEvent(
          req.body, 
          req.headers['stripe-signature'] as string, 
          config.stripe.webhook_secret as string
      );
      
  } catch (error) {
      
      // Return an error if verification fails
      throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Webhook signature verification failed. ${error}`,
      );
  }

  // Check if the event is valid
  if (!event) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event received!');
  }
    
    switch (event.type) {
        case 'payment_intent.succeeded':
            
          // Handle payment success
          break;
        case 'customer.subscription.created':
          
                start = event.data.object.current_period_start
                end = event.data.object.current_period_end
                
          // Handle new subscription
          break;
        case 'customer.subscription.updated':
          const customer = event.data.object.customer
                start = event.data.object.current_period_start
                end = event.data.object.current_period_end
                
          await User.updateUserSubscription(customer,start,end)
          start=0
          end=0
          break;
        case 'customer.subscription.deleted':
          const customerId = event.data.object.customer
          
            await User.CencelSubscription(customerId)
            
          // Handle subscription cancellation
          break;
        case 'invoice.payment_failed':
          // Handle payment failure
          break;
        case "invoice.payment_succeeded":
          
          const priceId = event.data.object.lines.data[0].price.id
          const subscription = event.data.object.subscription
          const email =  event.data.object.customer_email
          const customer_id = event.data.object.customer
          
          await User.addSubscription(email,subscription,start,end,priceId,customer_id)
          start=0
          end=0
            break;
      
      }
      
  
}

const expireUserSubcription = async ()=>{
  const users = await User.find({ 'subscriptions.end': {$lt: new Date()} })
  if(users.length){
    for(let user of users){
      await User.CencelSubscription(user.customerId!)
    }
  }
}

export const SubscriptionService = {
    subscribePlanToUser,
    subscribeWebHook,
    createSubscription,
    updateSubscriptionToDB,
    deleteProduct,
    getSubscriptions,
    manageSubscriptions,
    expireUserSubcription
}