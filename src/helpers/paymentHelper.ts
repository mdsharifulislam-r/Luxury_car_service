import { stripe } from "../app/modules/subscription/subscription.service";

const refund = async (paymentId: string,amount:number) => {
    const refund = await stripe.refunds.create({
        payment_intent: paymentId,
        amount: amount,
    });
    return refund;
}