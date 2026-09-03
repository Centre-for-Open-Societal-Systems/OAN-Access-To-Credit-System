/**
 * Catalog types live in `src/types/loan-catalog.ts` so the shared catalog
 * components under `src/components/loan-catalog` can use them without importing
 * from this feature. Re-exported here because they are still part of the farmer
 * feature's vocabulary and every existing import path keeps working.
 */
export type {
  CatalogCategoryFacet,
  CatalogFacets,
  CatalogFilters,
  CatalogProduct,
  CatalogQuery,
  CatalogSortKey,
  FarmerLoanProduct,
} from '@/types/loan-catalog';
export { resolveCategory } from '@/types/loan-catalog';

import type { CatalogProduct } from '@/types/loan-catalog';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
}

export interface PaginatedResponse<T> {
  data: T;
  message: string;
  pagination: Pagination;
}

export interface ApiResponse<T = void> {
  data: T;
  message: string;
}

export interface DetailedLoanProduct extends CatalogProduct {
  status?: string;
  description?: string;
  image?: string;
  creation?: string;
  modified?: string;
  product_meta?: {
    meta_key: string;
    meta_value: string;
  }[];
  categories?: string[];
  tags?: string[];
  attributes?: Record<string, string[]>;
}

export interface BankDetails {
  bank_name: string;
  bank_code: string;
  brand_name?: string;
  entity_type?: string;
  website?: string;
  logo_url?: string;
  region?: string;
  country?: string;
}

/**
 * A farmer's loan application row.
 *
 * Inferred from `farmerLoanApplicationSchema`, which extends the shared
 * `loanApplicationSummarySchema` the bank list already validates against — the
 * two endpoints return the same row, so they are described once and the type is
 * whatever the parser actually produces. Hand-writing it here let it drift:
 * `status` was typed `'Draft' | 'Under Review' | 'Disbursed' | 'Rejected'`, four
 * values the endpoint has never returned, which left every tab reading zero.
 *
 * On `status`: not a fixed set. Every bank names the stages of its own pipeline,
 * so this is `Active` while the application is still a draft with the farmer and
 * afterwards whatever that bank calls the stage it has reached. To decide what an
 * application *means*, read `is_terminal` / `is_successful` rather than matching
 * this string.
 */
import type { FarmerLoanApplication } from '@/lib/api/api.schemas';
export type { FarmerLoanApplication };

/**
 * True while the application is still with the farmer and has not been sent to
 * a bank.
 *
 * A draft sits on no stage, which is what distinguishes it — not the label
 * `Draft`, which is not a status this API produces at all (the backend calls the
 * pre-submission state `Active`). Submission is only offered for these.
 */
export function isDraftApplication(application: Pick<FarmerLoanApplication, 'stage_id'>): boolean {
  return !application.stage_id;
}

/** Shape returned by api.v1.farmer.dashboard.get_dashboard_summary.
 *
 *  `farmer_profile` comes back as an empty object until a consent binds an
 *  A2C Farmer Profile to the account, so it is optional rather than nullable —
 *  an unbound farmer is a normal state, not an error. */
/** Copied straight from A2C Farmer Profile. Every field is nullable because a
 *  profile created from a partial consent payload may not carry all of them —
 *  the card renders what is there rather than substituting a default. */
export interface FarmerDashboardProfile {
  first_name?: string | null;
  last_name?: string | null;
  farmer_id?: string | null;
  region?: string | null;
  woreda?: string | null;
  kebele?: string | null;
  farmland_size_hectares?: number | null;
  land_ownership_status?: string | null;
  source_of_income?: string | null;
}

export interface FarmerDashboardOffer {
  id: string;
  bank: string;
  loan_product_name: string;
  max_loan_amount: number;
  interest_rate: number;
  max_tenure_months: number;
}

export interface FarmerDashboardApplication {
  application_id: string;
  bank: string;
  loan_product_name: string;
  requested_amount: number;
  status: string;
  creation: string;
}

export interface FarmerDashboardSummary {
  farmer_profile?: FarmerDashboardProfile;
  top_loan_offers: FarmerDashboardOffer[];
  available_loan_types: string[];
  recent_applications: FarmerDashboardApplication[];
}

export interface CreateApplicationPayload {
  loan_product: string;
  requested_amount: number;
  loan_reason?: string;
}

export interface UpdateApplicationPayload {
  application_id: string;
  requested_amount?: number;
  loan_reason?: string;
}

/**
 * The lead a self-applying farmer's consent step is anchored on, plus where that
 * consent already stands so re-entering the flow resumes instead of restarting.
 *
 * A lead is required because every endpoint in the consent API takes a lead_id —
 * the same ones the Development Agent drives. The farmer has no lead of their own
 * until this is called, and cannot derive one from their A2C Farmer Profile,
 * because completing consent is what creates that profile.
 */
export interface FarmerConsentContext {
  lead_id: string;
  consent_request: string | null;
  consent_status: string | null;
  otp_verified: boolean;
  consent_completed: boolean;
}
