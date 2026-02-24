import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(5000).optional(),
  subtitle: z.string().max(200).optional(),
  price: z.number().int().min(0),
  image: z.string().max(500).optional().or(z.literal("")),
  imageDisplay: z.string().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  groupId: z.string().optional().nullable(),
  acceptStripe: z.boolean().optional(),
  acceptCrypto: z.boolean().optional(),
  deliveryType: z.enum(["SERIAL", "SERVICE"]).optional(),
});

export const productStatusSchema = z.object({
  status: z.enum(["UNDETECTED", "DETECTED", "FROZEN", "TESTING"]),
});

export const groupSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  image: z.string().max(500).optional().or(z.literal("")),
});

export const downloadItemSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProductInput = z.infer<typeof productSchema>;
