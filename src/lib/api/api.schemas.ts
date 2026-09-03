import { logger } from '@/lib/logger';
import { z } from 'zod';

// 1. consent.verify_otp
export const verifyOtpResponseSchema = z.object({
  lead_id: z.string().nullable().optional(),
  consent_request: z.string(),
  transaction_id: z.string(),
  status: z.string(),
});
export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;

// 2. consent.submit_consent
export const submitConsentResponseSchema = z.object({
  lead_id: z.string().nullable().optional(),
  consent_request: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  openg2p_consent_id: z.union([z.number(), z.string()]).nullable().optional(),
  consent_receipt: z.string().nullable().optional(),
  farmer_preview: z.record(z.string(), z.unknown()).nullable().optional(),
}).nullable().optional();
export type SubmitConsentResponse = z.infer<typeof submitConsentResponseSchema>;

// 3. consent.request_otp
export const sendOtpAndCreateConsentResponseSchema = z.object({
  consent_request: z.string(),
  transaction_id: z.string(),
  masked_phone: z.string(),
});
export type SendOtpAndCreateConsentResponse = z.infer<typeof sendOtpAndCreateConsentResponseSchema>;

export const loanApplicationStatusSchema = z
  .string()
  .nullish()
  .transform((val) => (val && val.trim() ? val : 'Unknown'));

// 4. loan_applications.get_full_profile
export const loanApplicationFullSchema = z.object({
  application_id: z.string(),
  lead_id: z.string().nullable().optional(),
  status: loanApplicationStatusSchema,
  stage_id: z.string().nullable().optional(),
  creation: z.string().nullable().optional(),
  farmer_profile: z.string().nullish().transform(val => val ?? undefined),
  phone_number: z.string().nullish().transform(val => val ?? ''),
  location: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  farmer_id: z.string().nullable().optional(),
  consent_id: z.string().nullable().optional(),
  loan_type: z.string().nullish().transform(val => val ?? undefined),
  loan_amount: z.number().nullable().optional(),
  profile_data: z.record(z.string(), z.unknown()).nullish(),
  loan_product: z.string().nullish().transform(val => val ?? undefined),
  loan_product_name: z.string().nullish().transform(val => val ?? undefined),
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
  farmland_size_hectares: z.union([z.number(), z.string()]).nullable().optional(),
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
  internal_notes: z.array(z.object({
    author: z.string().nullable().optional(),
    message: z.string().nullish().transform(val => val ?? ''),
    timestamp: z.string().nullable().optional(),
  })).nullable().optional(),
});
export type LoanApplicationFull = z.infer<typeof loanApplicationFullSchema>;

export const loanApplicationSummarySchema = z.object({
  application_id: z.string(),
  /**
   * The owning bank's name for the step the application has reached. Tenant free
   * text, resolved by the backend — not an archetype and not a fixed set, so the
   * client renders it rather than mapping it. Falls back to 'Unknown' when omitted
   * or null (e.g. during backend stage migrations).
   */
  status: loanApplicationStatusSchema,
  stage_id: z.string().nullable().optional(),
  // `get_all_loans` sends `step`; the farmer's `list_applications` rows do not,
  // so it cannot be required without failing every farmer-side parse.
  step: z.number().nullish().transform((val) => val ?? undefined),
  lead_id: z.string().nullable().optional(),
  loan_amount: z.number().nullable().optional(),
  loan_type: z.string().nullish().transform((val) => val ?? undefined),
  loan_product: z.string().nullish().transform((val) => val ?? undefined),
  loan_product_name: z.string().nullish().transform((val) => val ?? undefined),
  // Location is the three hierarchy fields, not one `location` string. `location`
  // was declared here and defaulted to '' — the endpoint selected a column that
  // does not exist on the doctype, Frappe dropped it from the SELECT silently, and
  // the default turned the missing field into a blank cell on every row.
  region: z.string().nullish().transform((val) => val ?? undefined),
  woreda: z.string().nullish().transform((val) => val ?? undefined),
  kebele: z.string().nullish().transform((val) => val ?? undefined),
  phone_number: z.string().nullish().transform((val) => val ?? ''),
  creation: z.string(),
  first_name: z.string().nullish().transform((val) => val ?? undefined),
  last_name: z.string().nullish().transform((val) => val ?? undefined),
  bank: z.string().nullish().transform((val) => val ?? undefined),
  // Stage placement, resolved server-side against the owning bank's pipeline.
  // `sequence` orders the stages; the two booleans are what tells a caller
  // whether a row is finished, and whether it finished well — the only honest
  // way to bucket a bank-defined label the client has never seen before.
  sequence: z.number().nullable().optional(),
  is_terminal: z.boolean().nullish().transform((val) => val ?? false),
  is_successful: z.boolean().nullish().transform((val) => val ?? false),
  stage: z.string().nullable().optional(),
  archetype_state: z.string().nullable().optional(),
});
export type LoanApplicationSummary = z.infer<typeof loanApplicationSummarySchema>;

/**
 * `farmer.applications.list_applications` / `get_application`.
 *
 * The same row as `loanApplicationSummarySchema` — same status semantics, same
 * stage placement fields — plus the four the farmer's own views need and the
 * bank list has no use for. Extended rather than redeclared so the two endpoints
 * cannot drift: a field added to the summary is a field the farmer list gets too.
 */
export const farmerLoanApplicationSchema = loanApplicationSummarySchema.extend({
  requested_amount: z.number().nullable().optional(),
  loan_product: z.string().nullable().optional(),
  loan_product_name: z.string().nullable().optional(),
  bank: z.string().nullable().optional(),
  loan_reason: z.string().nullish().transform((val) => val ?? undefined),
  // Snapshotted from the product at creation time. Null for applications made
  // before the snapshot existed — the card shows a placeholder rather than
  // inventing a rate, so null is kept rather than defaulted.
  interest_rate: z.number().nullable().optional(),
  tenure_months: z.number().nullable().optional(),
});
export type FarmerLoanApplication = z.infer<typeof farmerLoanApplicationSchema>;

/**
 * `loan_applications.get_loan_metadata` — the caller-scoped list of statuses the
 * signed-in user can actually see and filter on.
 *
 * This is the role-agnostic counterpart to `seller.loan_stages.get_stages`:
 * that endpoint is restricted to bank roles holding a bank binding, so a
 * Development Agent or a farmer calling it gets 403. `get_loan_metadata`
 * resolves per role instead — a Bank Agent sees its own bank's stages, a farmer
 * the stages of the banks they applied to, a Dev Agent / admin the union.
 */
export const loanStatusMetaSchema = z.object({
  status: z.string(),
  stage_id: z.string().nullable().optional(),
  sequence: z.number().nullable().optional(),
  is_terminal: z.boolean().nullish().transform((val) => val ?? false),
  is_successful: z.boolean().nullish().transform((val) => val ?? false),
});
export type LoanStatusMeta = z.infer<typeof loanStatusMetaSchema>;

export const loanMetadataSchema = z.object({
  statuses: z.array(loanStatusMetaSchema),
});
export type LoanMetadata = z.infer<typeof loanMetadataSchema>;

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
  user_type: z.enum(['bank_admin', 'bank_agent', 'dev_agent', 'marketplace', 'farmer', 'unknown']),
  bank: z.string().nullish(),
  bank_id: z.string().nullish(),
  bank_code: z.string().nullish(),
  bank_name: z.string().nullish(),
  bank_status: z.enum(['In Review', 'Active', 'Suspended']).nullish(),
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

// ==========================================
// Seller Feature API Schemas
// ==========================================

export const loanProductSummarySchema = z.object({
  name: z.string(),
  product_name: z.string(),
  slug: z.string().nullable().optional(),
  status: z.enum(['Active', 'Archived', 'Pending Approval', 'Rejected']),
  min_interest_rate: z.number(),
  max_interest_rate: z.number().nullable().optional(),
  min_amount: z.number().nullable().optional(),
  max_amount: z.number(),
  tenure_months: z.number(),
  creation: z.string().nullable().optional(),
  categories: z.array(z.string()).nullish().transform((val) => val ?? []),
  applications_count: z.number().nullish().transform((val) => val ?? 0),
  // `list_products` has always sent these three; they were absent here, so zod
  // stripped them and the bank's cards had no banner image to show. Declared now
  // that the bank renders the same ProductCard as the farmer catalogue. Optional
  // rather than required: a product created before an image field existed carries
  // none, and `bank_name` is resolved from a separate lookup that can miss.
  image: z.string().nullable().optional(),
  bank: z.string().nullable().optional(),
  bank_name: z.string().nullable().optional(),
});
export type LoanProductSummary = z.infer<typeof loanProductSummarySchema>;

export const loanProductDetailSchema = loanProductSummarySchema.extend({
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  bank: z.string().nullable().optional(),
  modified: z.string().nullable().optional(),
  product_meta: z.array(z.object({ meta_key: z.string(), meta_value: z.string() })).default([]),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  attributes: z.record(z.string(), z.array(z.string())).default({}),
});
export type LoanProductDetail = z.infer<typeof loanProductDetailSchema>;

export const sellerDashboardStatsSchema = z.object({
  total_products: z.number(),
  active_products: z.number(),
  // Volume vs reach: one farmer with three applications is 3 and 1 respectively.
  total_applications: z.number(),
  total_applicants: z.number(),
  // Everything still awaiting the bank — the `In Transition` archetype, which
  // spans every stage a bank defines inside its own pipeline.
  pending_applications: z.number(),
  pending_products: z.number().optional(),
  // Optional because the backend cannot honestly produce either one yet. The
  // `Rejected` archetype in docs/loan-status-workflow-plan.md was never built, so
  // approvals and rejections both land on `Completed` and are indistinguishable,
  // and no code path writes `approved_amount`. Requiring them here failed the
  // entire dashboard for two fields nothing renders.
  approved_applications: z.number().optional(),
  total_approved_amount: z.number().optional(),
});
export type SellerDashboardStats = z.infer<typeof sellerDashboardStatsSchema>;

export const taxonomyCategorySchema = z.object({
  term_id: z.string(),
  parent_category: z.string().nullable(),
  term_name: z.string().nullish().transform((val) => val ?? ''),
});
export type TaxonomyCategory = z.infer<typeof taxonomyCategorySchema>;

export const taxonomyTagSchema = z.object({
  term_id: z.string(),
  term_name: z.string().nullish().transform((val) => val ?? ''),
});
export type TaxonomyTag = z.infer<typeof taxonomyTagSchema>;

export const taxonomyAttributeSchema = z.object({
  term_id: z.string(),
  term_name: z.string().nullish().transform((val) => val ?? ''),
  slug: z.string().nullable().optional(),
});
export type TaxonomyAttribute = z.infer<typeof taxonomyAttributeSchema>;

export const teamUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  first_name: z.string().nullable().optional(),
  enabled: z.union([z.literal(0), z.literal(1)]),
  role: z.string().nullable().optional(),
  last_active: z.string().nullable().optional(),
  // True while the member is still on the temporary password their admin issued.
  // Older backends omit the field entirely, so treat "absent" as "already set".
  must_change_password: z.boolean().optional().default(false),
});
export type TeamUser = z.infer<typeof teamUserSchema>;

// Mirrors validate_password_complexity in the backend (oan_a2c/api/utils.py).
// Every place a user picks their own password validates against this one schema,
// so the rule the UI enforces can't drift from the rule the server enforces.
export interface PasswordRule {
  /** Shown in the checklist under a password field. */
  label: string;
  /** Returned by validation when the rule is not met. */
  message: string;
  test: (value: string) => boolean;
}

/**
 * The password policy, written once.
 *
 * `PasswordRequirements` renders this list as the live checklist and
 * `strongPasswordSchema` below is built from the same entries, so what a person
 * is told to satisfy and what their password is actually checked against cannot
 * drift apart. They were previously two hand-maintained copies of the same four
 * rules in two files.
 */
export const PASSWORD_RULES: ReadonlyArray<PasswordRule> = [
  {
    label: 'At least 8 characters',
    message: 'Password must be between 8 and 64 characters long.',
    test: (value) => value.length >= 8 && value.length <= 64,
  },
  {
    label: 'A letter',
    message: 'Password must contain at least 1 letter.',
    test: (value) => /[A-Za-z]/.test(value),
  },
  {
    label: 'A number',
    message: 'Password must contain at least 1 number.',
    test: (value) => /\d/.test(value),
  },
  {
    label: 'A symbol',
    message: 'Password must contain at least 1 special character.',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

// Rules are applied in order, so the first issue reported is the first unmet
// rule — which is what the forms surface.
export const strongPasswordSchema: z.ZodType<string> = PASSWORD_RULES.reduce<z.ZodType<string>>(
  (schema, rule) => schema.refine(rule.test, { message: rule.message }),
  z.string()
);

export const registerSellerSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters long.'),
  password: strongPasswordSchema,
  phone_number: z.string().min(8, 'Mobile number must be at least 8 digits.'),
});
export type RegisterSellerSchemaPayload = z.infer<typeof registerSellerSchema>;

export const loanStageSchema = z.object({
  // Optional because `get_stages` does not send either: the owning bank is
  // reported once on the enclosing payload, not repeated per stage, and there is
  // no separate doc `name` in the response. Requiring them made every call throw
  // "Data format error" out of validateResponse, taking the whole stage list
  // with it — a stricter schema than the endpoint has ever satisfied.
  name: z.string().optional(),
  bank: z.string().optional(),
  stage_id: z.string(),
  label: z.string(),
  archetype_state: z.string(),
  sequence: z.number(),
  external_code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  application_count: z.number().nullish().transform((val) => val ?? 0),
  creation: z.string().nullable().optional(),
  modified: z.string().nullable().optional(),
});
export type LoanStage = z.infer<typeof loanStageSchema>;

export const loanStagesDataSchema = z.object({
  bank: z.string().nullable().optional(),
  stages: z.array(loanStageSchema),
});
export type LoanStagesData = z.infer<typeof loanStagesDataSchema>;



