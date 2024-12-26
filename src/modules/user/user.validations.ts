import { z } from "zod";

// Zod Schema
const id = z.string().uuid();
const name = z
  .string()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(255, { message: "Username must be less than 255 characters long" });
const username = z
  .string()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(255, { message: "Username must be less than 255 characters long" });
const email = z.string().email();
const password = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(255, { message: "Password must be less than 255 characters long" })
  .refine((p) => /[A-Z]/.test(p), {
    message: "Password must contain an uppercase letter",
  })
  .refine((p) => /[a-z]/.test(p), {
    message: "Password must contain a lowercase letter",
  })
  .refine((p) => /[0-9]/.test(p), {
    message: "Password must contain a number",
  })
  .refine((p) => /[!@#$%^&*]/.test(p), {
    message: "Password must contain a special character",
  });
const bio = z
  .string()
  .max(255, { message: "Bio must be less than 255 characters long" });
const profile_img = z.string().url();

export const CreateUserSchema = z.object({
  username,
  email,
  password,
  name: name.optional(),
  bio: bio.optional(),
  profile_img: profile_img.optional(),
});

export const UpdateUserSchema = z.object({
  id,
  name: name.optional(),
  username: username.optional(),
  password: password.optional(),
  bio: bio.optional(),
  profile_img: profile_img.optional(),
});

export const DeleteUserSchema = z.object({
  id,
  password,
});

export const LoginSchema = z.object({
  username,
  password,
});
