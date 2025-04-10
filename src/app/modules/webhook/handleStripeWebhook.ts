import Stripe from "stripe";
import { stripe } from "../plan/plan.service";
import { Request } from "express";
import config from "../../../config";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { Order } from "../order/order.model";
import { handleSubcriptionCreated } from "../../../hendlers/handleSubcriptionCreated";
import { handleSubscribeDeleted } from "../../../hendlers/handleSubScribtionDeleted";

export const HandleStripeWebHook = async (req: Request) => {
    let event: any;
    let start = 0;
    let end = 0;
  
    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"] as string,
        config.stripe.webhook_secret as string
      );
    } catch (error) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Webhook signature verification failed. ${error}`
      );
    }
  
    if (!event) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid event received!");
    }
  
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          // Handle payment success
          break;
  
        case "customer.subscription.created":
            await handleSubcriptionCreated(event.data.object)
          break;
  
        case "customer.subscription.updated":
          const updatedSub = event.data.object;
          start = updatedSub.current_period_start;
          end = updatedSub.current_period_end;
  
          await User.updateUserSubscription(updatedSub.customer, start, end);
          break;
  
        case "customer.subscription.deleted":
            await handleSubscribeDeleted(event.data.object)
          break;
  
        case "invoice.payment_failed":
          // Handle payment failure (maybe send alert to user)
          break;
  
          case "invoice.payment_succeeded":
            break;
          
  
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          const payment_intent = session.payment_intent;
          const metadata = session.metadata?.orderData;
          
          if (metadata) {
            await Order.setPaymentIntent(metadata, payment_intent as any);
          }
          break;
  
        case "account.updated":
          const account = event.data.object as Stripe.Account;
          await User.HandleConnectStripe(account);
          break;
  
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
  
      return { received: true }; // Required by Stripe
    } catch (error) {
      console.error("Webhook error:", error);
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Stripe webhook handling failed"
      );
    }
  };