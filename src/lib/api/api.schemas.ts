import { z } from 'zod';
import { logger } from '@/lib/logger';

// 1. consent.verify_otp
export const verifyOtpResponseSchema = z.object({
  lead_id: z.string(),
  consent_request: z.string(),
  transaction_id: z.string(),
  status: z.string(),
});
export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;

// 2. consent.submit_consent
export const submitConsentResponseSchema = z.object({
  lead_id: z.string().optional(),
  consent_request: z.string().optional(),
  status: z.string().optional(),
  openg2p_consent_id: z.union([z.number(), z.string()]).optional(),
  consent_receipt: z.string().optional(),
  farmer_preview: z.object({
    given_name: z.string().default(''),
    family_name: z.string().default(''),
    email: z.string().nullish().transform(val => val ?? ''),
    phone_no: z.array(z.string()).default([]),
  }).optional(),
}).nullable().optional();
export type SubmitConsentResponse = z.infer<typeof submitConsentResponseSchema>;

// 3. consent.request_otp
export const sendOtpAndCreateConsentResponseSchema = z.object({
  consent_request: z.string(),
  transaction_id: z.string(),
  masked_phone: z.string(),
});
export type SendOtpAndCreateConsentResponse = z.infer<typeof sendOtpAndCreateConsentResponseSchema>;

// 4. loan_applications.get_full_profile
export const loanApplicationFullSchema = z.object({
  application_id: z.string(),
  lead_id: z.string().nullable().optional(),
  status: z.enum(['Draft', 'Processing', 'Approved', 'Rejected']),
  current_step: z.number().nullable().optional(),
  farmer_profile: z.string().nullish().transform(val => val ?? undefined),
  phone_number: z.string(),
  location: z.string().nullable().optional(),
  farmer_id: z.string().nullable().optional(),
  consent_id: z.string().nullable().optional(),
  loan_type: z.string(),
  loan_amount: z.number(),
  loan_reason: z.string().nullish().transform(val => val ?? ''),
  loan_officer: z.string().nullish().transform(val => val ?? undefined),
  first_name: z.string().nullish().transform(val => val ?? undefined),
  last_name: z.string().nullish().transform(val => val ?? undefined),
  father_name: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().nullish().transform(val => val ?? undefined),
  marital_status: z.string().nullish().transform(val => val ?? undefined),
  education_level: z.string().nullish().transform(val => val ?? undefined),
  national_id: z.string().nullable().optional(),
  woreda: z.string().nullable().optional(),
  kebele: z.string().nullable().optional(),
  purpose: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  primary_crops: z.string().nullable().optional(),
  crop_variety: z.string().nullable().optional(),
  farmland_size_hectares: z.number().nullable().optional(),
  expected_yield: z.union([z.number(), z.string()]).nullable().optional(),
  bank_account_no: z.string().nullable().optional(),
  ifsc_code: z.string().nullable().optional(),
  bank_name: z.string().nullable().optional(),
  account_holder: z.string().nullable().optional(),
  id_type: z.string().nullable().optional(),
  id_number: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  land_size: z.union([z.number(), z.string()]).nullable().optional(),
  farm_id: z.string().nullable().optional(),
  farm_polygon: z.string().nullable().optional(),
  land_acreage: z.union([z.number(), z.string()]).nullable().optional(),
  farm_land_number: z.string().nullable().optional(),
  size_of_family: z.union([z.number(), z.string()]).nullable().optional(),
  number_of_children: z.union([z.number(), z.string()]).nullable().optional(),
  no_of_females_family: z.union([z.number(), z.string()]).nullable().optional(),
  no_of_males_family: z.union([z.number(), z.string()]).nullable().optional(),
  family_member_owns_land_independently: z.union([z.boolean(), z.number(), z.string()]).nullable().optional(),
  source_of_income: z.string().nullable().optional(),
  total_farmland_size_as_landowner: z.union([z.number(), z.string()]).nullable().optional(),
  total_farmland_size_as_crop_sharing: z.union([z.number(), z.string()]).nullable().optional(),
  total_farmland_size_as_rented: z.union([z.number(), z.string()]).nullable().optional(),
  certification_id: z.string().nullable().optional(),
  certification_photo_url: z.string().nullable().optional(),
  land_ownership_status: z.string().nullable().optional(),
  soil_fertility_minerals: z.string().nullable().optional(),
  moisture_levels: z.string().nullable().optional(),
});
export type LoanApplicationFull = z.infer<typeof loanApplicationFullSchema>;

// 5. loan_applications.get_all_loans
export const loanApplicationSummarySchema = z.object({
  application_id: z.string(),
  status: z.enum(['Draft', 'Processing', 'Approved', 'Rejected']),
  step: z.number(),
  lead_id: z.string(),
  loan_amount: z.number(),
  loan_type: z.string(),
  location: z.string().nullish().transform(val => val ?? ''),
  phone_number: z.string(),
  creation: z.string(),
  first_name: z.string().nullish().transform(val => val ?? undefined),
  last_name: z.string().nullish().transform(val => val ?? undefined),
});
export type LoanApplicationSummary = z.infer<typeof loanApplicationSummarySchema>;

// 6. leads.add_lead_credit_info / get_lead_credit_infos
export const creditInfoApiSchema = z.object({
  name: z.string(),
  loan_type: z.string(),
  loan_amount: z.number(),
  purpose_message: z.string().optional(),
  created_by: z.string().optional(),
  creation: z.string().optional(),
});
export type CreditInfoAPI = z.infer<typeof creditInfoApiSchema>;

export const addCreditInfoResponseSchema = z.object({
  credit_info_id: z.string(),
});
export type AddCreditInfoResponse = z.infer<typeof addCreditInfoResponseSchema>;

// 7. auth.get_me
// `bank` is only populated for users with the "Bank Agent" role and the backend
// contract documents it only for `login` (not get_me) — so accept missing OR
// null rather than throwing on a valid response that omits it.
export const rawUserResponseSchema = z.object({
  email: z.string(),
  full_name: z.string(),
  roles: z.array(z.string()),
  bank: z.string().nullish(),
});
export type RawUserResponse = z.infer<typeof rawUserResponseSchema>;

/**
 * Validates data against a given Zod schema.
 * Logs contract violations with rich context for debugging and Sentry tracking,
 * then throws a clean, user-friendly validation error.
 */
export function validateResponse<T>(schema: z.ZodType<T>, data: unknown, endpointName: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedIssues = result.error.issues.map(({ path, code, message }) => ({
      path: path.join('.'),
      code,
      message,
    }));
    // Log only the failing field paths + messages — never `data` itself, which
    // for endpoints like get_full_profile carries PII (national_id, etc.).
    logger.error(
      `[API Contract Violation] Endpoint: ${endpointName} - Issues: ${JSON.stringify(formattedIssues)}`,
      {
        issues: formattedIssues,
      }
    );
    throw new Error(`Data format error in response from ${endpointName}. Please try again later.`);
  }
  return result.data;
}

