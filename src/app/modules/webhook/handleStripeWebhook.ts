import Stripe from "stripe";
import { stripe } from "../subscription/subscription.service";
import { Request } from "express";
import config from "../../../config";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { Order } from "../order/order.model";

export const HandleStrpeWebHook = async (req:Request)=>{
    
    let event: any;

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
          
              
                
          // Handle new subscription
          break;
        case 'customer.subscription.updated':
            break
        case 'customer.subscription.deleted':
            
          // Handle subscription cancellation
          break;
        case 'invoice.payment_failed':
          // Handle payment failure
          break;
        case "invoice.payment_succeeded":
          
            break;
        case 'checkout.session.completed':
            
            const session = event.data.object
            const payment_intent = session.payment_intent
            const metadata = session.metadata?.orderData
            if(metadata){
            await Order.setPaymentIntent(metadata,payment_intent)
            }
            
            break;
        case 'account.updated':
            const data = event.data.object as Stripe.Checkout.Session | Stripe.Account;
            await User.HandleConnectStripe(data as Stripe.Account)
            break
      
      }
      
  
}