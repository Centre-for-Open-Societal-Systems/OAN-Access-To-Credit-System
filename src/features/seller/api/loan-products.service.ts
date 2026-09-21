import {
  loanProductDetailSchema, loanProductSummarySchema, sellerDashboardStatsSchema, validateResponse, type LoanProductDetail, type LoanProductSummary, type SellerDashboardStats
} from '@/lib/api/api.schemas';
import { fetchApi } from '@/lib/api/fetchApi';
import { toProxiedFileUrl } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';
import type {
  CreateLoanProductPayload, ListProductsParams, UpdateLoanProductPayload
} from '../types/loan-products.types';

const DEFAULT_ARCHIVE_REASON = 'Archived by seller';

// Bank admins publish their own products without a second pair of eyes, so the
// approval has no human-written comment. The audit log still needs a reason, and
// this wording says plainly that no review took place — an empty or generic
// "Approved" would read as though someone had checked it.
const AUTO_APPROVAL_REASON = 'Auto-approved: created or edited by bank admin';

export const loanProductsService = {
  async listProducts(params?: ListProductsParams): Promise<ApiResponse<LoanProductSummary[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });
    }
    const queryString = query.toString();
    const path = queryString
      ? `v1/banks/me/products?${queryString}`
      : 'v1/banks/me/products';

    const raw = (await fetchApi(path)) as ApiResponse<Record<string, unknown>>;
    const productsData = raw.data?.products;

    return {
      ...raw,
      data: validateResponse(z.array(loanProductSummarySchema), productsData, 'seller.list_products'),
    };
  },

  async getProduct(productId: string): Promise<ApiResponse<LoanProductDetail>> {
    const path = `v1/banks/me/products/${encodeURIComponent(productId)}`;
    const raw = (await fetchApi(path)) as ApiResponse<Record<string, unknown>>;
    const productData = raw.data?.product;

    const detail = validateResponse(loanProductDetailSchema, productData, 'seller.get_product');
    // Route the product image through the same-origin file proxy so it renders
    // (backend file URLs need auth and are blocked by our CSP img-src).
    if (detail.image) detail.image = toProxiedFileUrl(detail.image) ?? null;

    return {
      ...raw,
      data: detail,
    };
  },

  // Review comment left by the Bank Admin when a product was rejected. Only
  // meaningful for Rejected products; other statuses generally have none.
  async getProductComment(productId: string): Promise<ApiResponse<string | null>> {
    const raw = (await fetchApi(`v1/banks/me/products/${encodeURIComponent(productId)}/audit-log`)) as ApiResponse<unknown>;

    return {
      ...raw,
      data: extractProductComment(raw.data),
    };
  },

  async createProduct(payload: CreateLoanProductPayload): Promise<ApiResponse<{ product_ids: string[] }>> {
    return fetchApi('v1/banks/me/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ product_ids: string[] }>>;
  },

  async updateProduct(payload: UpdateLoanProductPayload): Promise<ApiResponse<{ product_id: string }>> {
    return fetchApi(`v1/banks/me/products/${encodeURIComponent(payload.product_id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ product_id: string }>>;
  },

  async setProductStatus(productId: string, status: 'Active' | 'Archived' | 'Rejected' | 'Pending Approval', reason?: string): Promise<ApiResponse<null>> {
    const finalReason = reason ?? (status === 'Archived' ? DEFAULT_ARCHIVE_REASON : undefined);
    return fetchApi(`v1/banks/me/products/${encodeURIComponent(productId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason: finalReason }),
    }) as Promise<ApiResponse<null>>;
  },

  async archiveProduct(productId: string, reason = DEFAULT_ARCHIVE_REASON): Promise<ApiResponse<null>> {
    return this.setProductStatus(productId, 'Archived', reason);
  },

  async getDashboardStats(bankCode?: string): Promise<ApiResponse<SellerDashboardStats>> {
    const path = bankCode
      ? `v1/banks/me/dashboard/stats?bank=${encodeURIComponent(bankCode)}`
      : 'v1/banks/me/dashboard/stats';

    const raw = (await fetchApi(path)) as ApiResponse<Record<string, unknown>>;
    const statsData = raw.data?.stats;

    return {
      ...raw,
      data: validateResponse(sellerDashboardStatsSchema, statsData, 'seller.get_stats'),
    };
  },
};

// The backend returns an audit log under `data.comment`: one entry per status
// change, each with a `reason` (and a fuller `event_description`). The seller
// cares about why the product was rejected, so surface the reason from the most
// recent "-> Rejected" transition, falling back to the newest entry that has
// any reason at all. Returns null when there's nothing to show.
interface ProductCommentEntry {
  reason?: string | null;
  event_description?: string | null;
  to_status?: string | null;
  creation?: string | null;
}

function extractProductComment(data: unknown): string | null {
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  const list = record?.comment ?? record?.comments;
  const entries: ProductCommentEntry[] = Array.isArray(list) ? (list as ProductCommentEntry[]) : [];

  // Newest first — the audit log isn't guaranteed to be ordered.
  const byNewest = [...entries].sort((a, b) => (b.creation ?? '').localeCompare(a.creation ?? ''));

  const entryText = (entry: ProductCommentEntry): string | null =>
    cleanText(entry.reason) ?? cleanText(entry.event_description);

  const rejected = byNewest.find((e) => e.to_status === 'Rejected' && entryText(e));
  const chosen = rejected ?? byNewest.find((e) => entryText(e));

  return chosen ? entryText(chosen) : cleanText(data);
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export { DEFAULT_ARCHIVE_REASON, AUTO_APPROVAL_REASON };
