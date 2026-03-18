import { z } from "zod";

// =====================
// AUTH
// =====================
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// =====================
// PROFILE
// =====================
export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number")
    .nullable()
    .optional(),
  avatar_url: z.string().url().nullable().optional(),
});

// =====================
// ADDRESS
// =====================
export const addressSchema = z.object({
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().min(2, "Country is required"),
  is_default: z.boolean().default(false),
});

// =====================
// CHECKOUT
// =====================
export const checkoutSchema = z.object({
  shipping_address_id: z.string().uuid("Please select a shipping address"),
});

// =====================
// CART ITEM
// =====================
export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1, "Quantity must be at least 1").max(99),
});

// =====================
// INFERRED TYPES
// =====================
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type CartItemFormData = z.infer<typeof cartItemSchema>;
