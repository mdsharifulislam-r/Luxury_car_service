import { z } from "zod";
import { DISCLAIMBER_TYPE } from "../../../enums/disclamberType";

const createDisclaimberZodSchema = z.object({
    body: z.object({
        content: z.string({ required_error: "Content is required" }),
        type:z.nativeEnum(DISCLAIMBER_TYPE)
    }),
})


export const DisclaimberValidation = {
    createDisclaimberZodSchema,
}