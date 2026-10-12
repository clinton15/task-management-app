import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

const roleSchema = z.enum(["ADMIN", "USER"]);

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: passwordSchema,
  role: roleSchema.optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").optional(),
    email: z.email("Invalid email address").trim().toLowerCase().optional(),
    password: passwordSchema.optional(),
    role: roleSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
