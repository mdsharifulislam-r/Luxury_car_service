import { z } from 'zod';
import { SERVICE_CATEGORY } from '../../../enums/serviceCatagories';

export const createServiceZodSchema = z.object({
  body: z.object({
    title: z.string({required_error:"title required"}),
    price: z.string({required_error:"price required"}),
    description: z.string().optional(),
    category:z.string({required_error:"category required"}), // Replace with actual categories
    car_model: z.string({required_error:" car_model required"}),
    image: z.any(),
  })
})

const updateServiceZodSchema = z.object({
    body: z.object({
    title: z.string().optional(),
    price: z.string().optional(),
    description: z.string().optional(),
    category: z.nativeEnum(SERVICE_CATEGORY),
    car_model: z.string().optional(),
    image: z.any(),
  })
})

export const ServiceValidation = {
  createServiceZodSchema,
  updateServiceZodSchema,
}
