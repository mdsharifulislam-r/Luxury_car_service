import { z } from "zod";
import { SUBSCRIPTION_PLAN_TYPE } from "../../../enums/subscriptionPlan";

const createSubscriptionZodSchema = z.object({
    body: z.object({
        title: z.string(),
        description: z.string().optional(),
        price: z.number(),
        inclusions: z.array(z.string()),
        Benefits: z.array(z.string()),
        plan: z.enum(['month', 'year','day','week']),
      })
})

const updateSubscriptionZodSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        inclusions: z.array(z.string()).optional(),
        Benefits: z.array(z.string()).optional(),
        plan: z.nativeEnum(SUBSCRIPTION_PLAN_TYPE).optional(),
      })
})

const createSubscribePlanZodSchema = z.object({
    body: z.object({
        price_id:z.string({required_error:"price_id is required"})
      })
})

export const PlanValidation = {
    createSubscriptionZodSchema,
    updateSubscriptionZodSchema,
    createSubscribePlanZodSchema,
};