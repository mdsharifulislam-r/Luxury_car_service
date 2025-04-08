import { z } from "zod";

const createSendMassageZodSchema  = z.object({
    body: z.object({
        chatId: z.string({
            required_error: 'Chat ID is required'
        }),
        text: z.string({
            required_error: 'Text is required'
        }).optional(),
        image: z.string({
            required_error: 'Image is required'
        }).optional()
    })
})

export const messageValidation = {
    createSendMassageZodSchema
}