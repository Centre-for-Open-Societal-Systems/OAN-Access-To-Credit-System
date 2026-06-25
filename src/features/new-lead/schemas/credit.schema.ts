import { z } from 'zod';

export const creditInfoSchema = z.object({
  loanType: z.string().min(1, "Loan Type is required"),
  purposeMessage: z.string().trim().min(1, "Purpose Message is required"),
  loanAmount: z.string()
    .transform((val) => val.replace(/,/g, ''))
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && isFinite(val) && val > 0, { message: "Amount must be a positive number" })
    .transform((val) => Number(val.toFixed(2)))
});

export type CreditInfoFormData = z.infer<typeof creditInfoSchema>;
