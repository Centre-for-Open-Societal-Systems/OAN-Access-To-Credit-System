import { z } from 'zod';
import { PHONE_NUMBER_ERROR, PHONE_NUMBER_REGEX, stripDialCode, stripLeadingZero, toDigitsOnly } from '@/lib/validation/phone';

// The lead form's phone field has no country-code selector — it captures
// the local number only (e.g. 912345678 for +251-912345678); a pasted
// trunk 0 or +251 prefix is dropped. Per-country length is the backend's call.
// Spaces, dashes, and parentheses are stripped before validating so what
// gets validated is exactly what gets submitted. The +251 country code is
// added separately when building the create_lead payload (see
// submitNewLeadThunk in newLeadSlice.ts) — this field itself only ever
// holds a bare local number.
export const createLeadSchema = z.object({
  phoneNumber: z
    .string()
    .transform((value) => stripLeadingZero(stripDialCode(toDigitsOnly(value.trim()))))
    .pipe(z.string().regex(PHONE_NUMBER_REGEX, PHONE_NUMBER_ERROR)),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
