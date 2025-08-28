import z from "zod";
import { WalletStatus } from "./wallet.interface";

export const addMoneyZodSchema = z.object({
  amount: z
    .number({ invalid_type_error: "amount must be number" })
    .positive({ message: "amount must be positive" }),
});

export const updateWalletStatusZodSchema = z.object({
  status: z.enum([WalletStatus.BLOCK, WalletStatus.UNBLOCK]),
});
