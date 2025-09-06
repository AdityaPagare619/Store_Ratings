import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400).optional().or(z.literal("").transform(() => undefined)),
  password: z
    .string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
});

export const ratingSchema = z.object({
  storeId: z.number().int().positive(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(400).optional(),
});