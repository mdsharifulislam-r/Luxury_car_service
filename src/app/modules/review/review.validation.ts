import { z } from "zod";

const createGiveReviewZodSchema = z.object({
    body: z.object({
        bookingId: z.string({
            required_error: "Booking ID is required",
        }),
        comment: z.string().optional(),
        star: z.number({
            required_error: "Star is required",
        }).min(1).max(5, "Star must be between 1 and 5"),
    })
})

export const ReviewValidation = {
    createGiveReviewZodSchema
}