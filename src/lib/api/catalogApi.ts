import { fetchApi } from '@/lib/api/fetchApi';
import { withQuery } from '@/lib/utils';
import type {
  CatalogFacetsResponse,
  CatalogListResponse,
  CatalogQuery,
} from '@/types/loan-catalog';

/**
 * The loan-product catalog.
 *
 * One endpoint, two audiences: a farmer gets the Active products of every bank,
 * and a bank user gets their own bank's products across every status. The
 * scoping is decided server-side from the session, so there is no bank
 * parameter to pass here — which is also why this lives in lib rather than in
 * either portal's feature.
 */
export async function getCatalog(params: CatalogQuery = {}): Promise<CatalogListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  // Bank-side only. Left out entirely when nothing is selected, which is what
  // gets the endpoint's default for a bank user (every status but Archived);
  // a farmer caller is pinned to Active server-side either way.
  if (params.status) query.append('status', params.status);
  if (params.min_amount !== undefined) query.append('min_amount', params.min_amount.toString());
  if (params.max_amount !== undefined) query.append('max_amount', params.max_amount.toString());
  if (params.max_interest_rate !== undefined) query.append('max_interest_rate', params.max_interest_rate.toString());
  // `min_tenure_months`/`max_tenure_months` — the only tenure params
  // ListCatalogSchema accepts. This used to send a comma-separated `tenure_months`,
  // which the schema has no field for, so pydantic dropped it and the chips filtered
  // nothing. One exact tenure is the same value on both bounds.
  if (params.tenure_months !== undefined) {
    query.append('min_tenure_months', params.tenure_months.toString());
    query.append('max_tenure_months', params.tenure_months.toString());
  }
  // Comma-joined rather than repeated: `list_catalog` reads this through
  // parse_multi_value, and Frappe's form parsing keeps only the last value of a
  // repeated query param — so `?category=a&category=b` would silently filter by
  // b alone. Nothing is sent when no loan type is ticked.
  if (params.categories?.length) query.append('category', params.categories.join(','));
  // Sent only when set. FarmerCatalogSchema types this as `bool | None`, and
  // pydantic's lax mode reads the string '1' as True; omitting the param leaves
  // it None, which is the "no bookmark filter" branch on the backend.
  if (params.is_saved) query.append('is_saved', '1');
  if (params.sort_by) query.append('sort_by', params.sort_by);
  if (params.limit !== undefined) query.append('limit', params.limit.toString());
  if (params.start !== undefined) query.append('start', params.start.toString());
  if (params.loan_product) query.append('loan_product', params.loan_product);

  return fetchApi(withQuery('v1/catalog/products', query));

}

/**
 * Filter options for the discovery sidebar, derived from the live catalog.
 *
 * Fetched rather than hardcoded so the sidebar can never offer a filter that
 * matches nothing — and never offers one the catalog endpoint cannot apply.
 *
 * Catalog-wide: unlike `getCatalog`, this has no bank dimension, so a bank-side
 * view must not use it — it would offer other banks' tenures and amount ranges
 * and filter the bank's own list to nothing. Those views derive their options
 * from their own products instead (`deriveCatalogFacets`).
 */
export async function getCatalogFacets(): Promise<CatalogFacetsResponse> {
  return fetchApi('v1/catalog/facets');
}
