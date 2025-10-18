import { z } from "zod";

// Max file size 2MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export const profileSchema = z.object({
  uid: z.string().min(1, "User ID is required."),
  username: z.string().min(2, {
    message: "Username harus terdiri dari minimal 2 karakter.",
  }),
  name: z.string().min(2, {
    message: "Nama harus terdiri dari minimal 2 karakter.",
  }),
  email: z.string().email({
    message: "Email tidak valid",
  }),
  bio: z.string().min(2, {
    message: "Bio harus terdiri dari minimal 2 karakter.",
  }),
  avatar: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
      "Ukuran file maksimal 10mb"
    )
    .refine(
      (files) => 
        !files || 
        files.length === 0 || 
        ALLOWED_FILE_TYPES.includes(files[0]?.type),
      "Hanya format .jpg, .jpeg, .png, dan .webp yang didukung"
    ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export interface ProfileFormData {
  uid: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  avatar?: string | null;
}