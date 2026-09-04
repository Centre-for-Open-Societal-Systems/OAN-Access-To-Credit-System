import { z } from 'zod';
import { toDigitsOnly } from '@/lib/validation/phone';

// The lead form's phone field has no country-code selector — it captures
// the local 10-digit number only (matching the input's maxLength=10).
// Spaces, dashes, and parentheses are stripped before validating so what
// gets validated is exactly what gets submitted. The +251 country code is
// added separately when building the create_lead payload (see
// submitNewLeadThunk in newLeadSlice.ts) — this field itself only ever
// holds a bare local number.
export const createLeadSchema = z.object({
  phoneNumber: z
    .string()
    .transform((value) => toDigitsOnly(value.trim()))
    .pipe(z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
