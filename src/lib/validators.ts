import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  regNumber: z.string().min(1, "Registration number is required"),
  classId: z.string().min(1, "Class is required"),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});

export const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  staffIdNumber: z.string().min(1, "Staff ID number is required"),
});

export const resultSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  sessionId: z.string().min(1),
  termId: z.string().min(1),
  ca1: z.number().min(0).max(30),
  ca2: z.number().min(0).max(30),
  ca3: z.number().min(0).max(20),
  exam: z.number().min(0).max(60),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
