import { fetchApi } from '@/lib/api/fetchApi';
import { farmerLoanApplicationSchema, validateResponse } from '@/lib/api/api.schemas';
import { z } from 'zod';
import type { LoanStatusMeta } from '@/lib/api/api.schemas';
import type {
  CreateApplicationPayload,
  FarmerLoanApplication,
  FarmerDashboardSummary,
  FarmerLoanProduct,
  DetailedLoanProduct,
  BankDetails,
  PaginatedResponse,
  UpdateApplicationPayload,
  ApiResponse,
} from '../types';

// The catalog endpoint is shared with the bank portals, so it lives in lib.
// Re-exported here because it is part of this feature's API surface and every
// existing caller imports it from farmerApi.
export { getCatalog, getCatalogFacets } from '@/lib/api/catalogApi';

/**
 * Retrieves the farmer's bookmarked/saved products.
 */
export async function getSavedProducts(
  params: { limit?: number; start?: number } = {}
): Promise<PaginatedResponse<{ products: FarmerLoanProduct[] }>> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.append('limit', params.limit.toString());
  if (params.start !== undefined) query.append('start', params.start.toString());

  return fetchApi(`oan_a2c.api.v1.farmer.catalog.get_saved_products?${query.toString()}`);
}

/**
 * Bookmarks a product for the farmer.
 */
export async function saveBookmark(loan_product: string): Promise<ApiResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.catalog.save_product', {
    method: 'POST',
    body: JSON.stringify({ loan_product }),
  });
}

/**
 * Removes a bookmark for the farmer.
 */
export async function removeBookmark(loan_product: string): Promise<ApiResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.catalog.unsave_product', {
    method: 'POST',
    body: JSON.stringify({ loan_product }),
  });
}

/**
 * Retrieves a list of applications owned by the farmer.
 *
 * `status` takes a bank stage label or stage ID (or a JSON array of them);
 * `archetype` takes one of the four platform-level buckets. Both are validated
 * server-side.
 */
export async function getMyApplications(
  params: { status?: string; archetype?: string; page?: number; page_size?: number } = {}
): Promise<PaginatedResponse<FarmerLoanApplication[]>> {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.archetype) query.append('archetype', params.archetype);
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.page_size !== undefined) query.append('page_size', params.page_size.toString());

  const response = await fetchApi(`oan_a2c.api.v1.farmer.applications.list_applications?${query.toString()}`);

  // Validated, not cast. `fetchApi` returns `any`, so the declared return type
  // was an assertion nothing checked — a row arriving without `status` (which
  // the backend does send as null mid stage-migration) falls back to 'Unknown'
  // via farmerLoanApplicationSchema rather than failing the whole list.
  return {
    ...response,
    data: validateResponse(
      z.array(farmerLoanApplicationSchema),
      response?.data ?? [],
      'list_applications'
    ),
  };
}

/** Hard ceiling on the paging loop below, so a runaway response can't spin. */
const MAX_APPLICATION_PAGES = 10;
const APPLICATION_PAGE_SIZE = 100;

/**
 * Every application the farmer has, across all pages.
 *
 * The list view needs the whole set, not a page of it: the tab counts are per
 * stage and have to be exact, and there is no farmer-side counterpart to
 * `get_loan_summary` to ask for those counts directly. Called with no arguments
 * at all, this endpoint returns 20 rows — so a farmer with more applications
 * than that was shown a truncated list, with tab counts computed over the
 * truncation and no paging control to reach the rest.
 *
 * A farmer holds a handful of applications, so fetching them all is cheap. If
 * that stops being true, the fix is a counts endpoint, not a bigger page size.
 */
export async function getAllMyApplications(): Promise<FarmerLoanApplication[]> {
  const applications: FarmerLoanApplication[] = [];

  for (let page = 1; page <= MAX_APPLICATION_PAGES; page += 1) {
    const response = await getMyApplications({ page, page_size: APPLICATION_PAGE_SIZE });
    applications.push(...(response.data ?? []));
    if (!response.pagination?.has_next) break;
  }

  return applications;
}

/**
 * The statuses this farmer can see — the stages of the banks they have applied
 * to, resolved server-side per role.
 *
 * Shares `loan_applications.get_loan_metadata` with the bank and dev-agent
 * lists. There is no farmer-specific variant, and no fixed list to fall back on:
 * a stage label belongs to the bank that defined it.
 */
export async function getLoanStatusMetadata(): Promise<ApiResponse<{ statuses: LoanStatusMeta[] }>> {
  return fetchApi('oan_a2c.api.v1.loan_applications.get_loan_metadata');
}

/**
 * Retrieves a single application by application_id.
 */
export async function getApplication(application_id: string): Promise<ApiResponse<FarmerLoanApplication>> {
  const response = await fetchApi(`oan_a2c.api.v1.farmer.applications.get_application?application_id=${encodeURIComponent(application_id)}`);

  return {
    ...response,
    data: validateResponse(farmerLoanApplicationSchema, response?.data, 'get_application'),
  };
}

/**
 * Creates a new Draft application.
 */
export async function startApplication(
  data: CreateApplicationPayload
): Promise<ApiResponse<{ application_id: string }>> {
  return fetchApi('oan_a2c.api.v1.farmer.applications.create_application', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Updates an existing Draft application.
 */
export async function updateApplication(
  data: UpdateApplicationPayload
): Promise<ApiResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.applications.update_application', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Submits an application to the bank (Draft -> Processing).
 */
export async function submitApplication(application_id: string): Promise<ApiResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.applications.submit_application', {
    method: 'POST',
    body: JSON.stringify({ application_id }),
  });
}

/**
 * Fetches dashboard summary for the farmer.
 */
export async function getDashboardSummary(): Promise<ApiResponse<FarmerDashboardSummary>> {
  return fetchApi('oan_a2c.api.v1.farmer.dashboard.get_dashboard_summary');
}

/**
 * Retrieves detailed information for a loan product.
 */
export async function getProduct(productId: string): Promise<ApiResponse<{ product: DetailedLoanProduct }>> {
  return fetchApi(`oan_a2c.api.v1.seller.loan_products.get_product?product_id=${encodeURIComponent(productId)}`);
}

/**
 * Retrieves bank storefront details and branding.
 */
export async function getBankDetails(bank: string): Promise<ApiResponse<BankDetails>> {
  return fetchApi(`oan_a2c.api.v1.farmer.catalog.get_bank_details?bank=${encodeURIComponent(bank)}`);
}


