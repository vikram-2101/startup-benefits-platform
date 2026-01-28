import { z } from "zod";

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    password: z.string({ required_error: "Password is required" }),
  }),
});

// Deal Schemas
export const getDealsSchema = z.object({
  query: z.object({
    category: z
      .enum([
        "cloud",
        "marketing",
        "analytics",
        "productivity",
        "design",
        "development",
        "communication",
        "finance",
        "other",
      ])
      .optional(),
    isLocked: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    search: z.string().optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, "Page must be greater than 0")
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
      .optional(),
  }),
});

export const getDealByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid deal ID format"),
  }),
});

// Claim Schemas
export const createClaimSchema = z.object({
  body: z.object({
    dealId: z
      .string({ required_error: "Deal ID is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid deal ID format"),
  }),
});
