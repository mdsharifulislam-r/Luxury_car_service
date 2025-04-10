import { JwtPayload } from "jsonwebtoken";
import { stripe } from "../plan/plan.service";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";

const createStripeAccoutToDB = async (user:JwtPayload,stripe_id:string="")=>{
    const isExistUser = await User.findById(user.id);
    
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (isExistUser.accountInfo?.stripeAccountId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Account already exist!");
    }
    if (stripe_id) {
        await User.findOneAndUpdate(
            { _id: user.id,verified: true },
            { $set: { 'accountInfo.stripeAccountId': stripe_id } }
        );
        return isExistUser;
    }

    const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
            
        },
        business_type: 'individual',
        individual: {
            first_name: isExistUser.name,
            email: isExistUser.email,
        },
        business_profile:{
                mcc: "7299",
                product_description: "Freelance services on demand",
                url: "https://yourplatform.com",
        }
    });
    
    
    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://your-website.com/reauth',
        return_url: 'https://your-website.com/return',
        type: 'account_onboarding',
      });
    await User.findOneAndUpdate(
        { _id: user.id },
        { accountInfo:{
            stripeAccountId: account.id,
            stripeAccountLink: accountLink.url,
        } } 
    );
    if (!account) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create account');
    }
    return {
        accountLink,
    };
}

const paymentToProvider = async (user:JwtPayload,amount:number)=>{}

export const PaymentService = {
    createStripeAccoutToDB
}