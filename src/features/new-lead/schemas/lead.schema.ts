import { z } from 'zod';

export const createLeadSchema = z.object({
  phoneNumber: z.string()
    .min(5, 'Phone number is too short')
    .regex(/^\+?[0-9\s\-()]+$/, 'Not a valid phone number format')
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
