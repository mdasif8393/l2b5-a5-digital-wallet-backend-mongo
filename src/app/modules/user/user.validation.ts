import z from "zod";
import { AgentStatus, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  email: z
    .string({ invalid_type_error: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  password: z
    .string({ invalid_type_error: "Password must be string" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^.{8,}$/, {
      message: "Password must contain at least 8 characters.",
    }),
  phone: z
    .string({ invalid_type_error: "Phone Number must be string" })
    .regex(/^01[3-9][0-9]{8}$/, {
      message: "Phone number must be valid for Bangladesh. Format: 01XXXXXXXXX",
    }),
  address: z
    .string({ invalid_type_error: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters." }),
  role: z.enum(Object.values(Role) as [string, ...string[]]),
});

export const updateAgentStatus = z.object({
  agentStatus: z.enum([AgentStatus.APPROVED, AgentStatus.SUSPENDED]),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),
  password: z
    .string({ invalid_type_error: "Password must be string" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^.{8,}$/, {
      message: "Password must contain at least 8 characters.",
    })
    .optional(),
  phone: z
    .string({ invalid_type_error: "Phone Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  address: z
    .string({ invalid_type_error: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
});
