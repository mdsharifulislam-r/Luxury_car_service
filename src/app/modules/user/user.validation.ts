import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    address: z.string({ required_error: 'address is required' }),
    profile: z.string().optional(),
    role:z.enum([USER_ROLES.SUPER_ADMIN,USER_ROLES.CUSTOMER,USER_ROLES.PROVIDER])
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});

const createDeleteUserValidationZodSchema = z.object({
  body:z.object({
    password:z.string({required_error:"Password is required"})
  })
})

const createLocationValidationZodSchema = z.object({
  body:z.object({
    latitude:z.number({required_error:"latitude is required"}),
    longitude:z.number({required_error:"longitude is required"})
  })
})
export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  createDeleteUserValidationZodSchema,
  createLocationValidationZodSchema
};
