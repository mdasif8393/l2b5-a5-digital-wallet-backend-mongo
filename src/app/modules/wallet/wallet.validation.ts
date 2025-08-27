import z from "zod";

export const addMoneyZodSchema = z.object({
  amount: z
    .number({ invalid_type_error: "amount must be number" })
    .positive({ message: "amount must be positive" }),
});
