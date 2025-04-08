import { z } from "zod";
import { ORDER_STATUS } from "../../../enums/orderStatus";

const createBookOrderZodSchema = z.object({
    body: z.object({
        service: z.string({
            required_error: 'Service is required'
        }),
        location: z.string({
            required_error: 'Location is required'
        }),
        date: z.string({
            required_error: 'Date is required'
        }).optional(),
        time: z.string({
            required_error: 'Time is required'
        }).optional(),
        schedule: z.object({
            start_date: z.string({}).optional(),
            end_date: z.string({}).optional()
        }).optional(),

    })
})

const changeOrderStatusZodSchema = z.object({
    body:z.object({
        status:z.enum([
            ORDER_STATUS.PENDING,
            ORDER_STATUS.IN_PROGRESS,
            ORDER_STATUS.REJECTED,
            ORDER_STATUS.COMPLETED
        ], {
            required_error: 'Status is required'
        })
    })
})
export const orderValidation = {
    createBookOrderZodSchema,
    changeOrderStatusZodSchema
}