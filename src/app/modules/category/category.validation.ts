import { z } from "zod";

const createCategoryZodSchema = z.object({
    body: z.object({
        name: z.string({required_error:"name is required"}),
        image:z.any({required_error:"image is required"}),
    })
})

const createUpdateCategoryZodSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        image:z.any().optional(),
    })
})

export const CategoryValidation = {
    createCategoryZodSchema,
    createUpdateCategoryZodSchema
}