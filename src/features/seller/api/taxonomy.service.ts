import {
    taxonomyAttributeSchema, taxonomyCategorySchema,
    taxonomyTagSchema, validateResponse, type TaxonomyAttribute, type TaxonomyCategory,
    type TaxonomyTag
} from '@/lib/api/api.schemas';
import { fetchApi } from '@/lib/api/fetchApi';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';

export const taxonomyService = {
  async getCategories(): Promise<ApiResponse<TaxonomyCategory[]>> {
    const raw = (await fetchApi('v1/taxonomy/categories')) as ApiResponse<Record<string, unknown>>;
    return {
      ...raw,
      data: validateResponse(z.array(taxonomyCategorySchema), raw.data?.categories, 'seller.get_categories'),
    };
  },

  async getTags(): Promise<ApiResponse<TaxonomyTag[]>> {
    const raw = (await fetchApi('v1/taxonomy/tags')) as ApiResponse<Record<string, unknown>>;
    return {
      ...raw,
      data: validateResponse(z.array(taxonomyTagSchema), raw.data?.tags, 'seller.get_tags'),
    };
  },

  async getAttributes(): Promise<ApiResponse<TaxonomyAttribute[]>> {
    const raw = (await fetchApi('v1/taxonomy/attributes')) as ApiResponse<Record<string, unknown>>;
    return {
      ...raw,
      data: validateResponse(z.array(taxonomyAttributeSchema), raw.data?.attributes, 'seller.get_attributes'),
    };
  },

  async setProductCategories(productId: string, termIds: string[]): Promise<ApiResponse<null>> {
    return fetchApi(`v1/banks/me/products/${encodeURIComponent(productId)}/categories`, {
      method: 'PUT',
      body: JSON.stringify({ term_ids: termIds }),
    }) as Promise<ApiResponse<null>>;
  },

  async setProductTags(productId: string, termIds: string[]): Promise<ApiResponse<null>> {
    return fetchApi(`v1/banks/me/products/${encodeURIComponent(productId)}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ term_ids: termIds }),
    }) as Promise<ApiResponse<null>>;
  },

  async setProductAttributes(productId: string, attributes: Record<string, string[]>): Promise<ApiResponse<null>> {
    return fetchApi(`v1/banks/me/products/${encodeURIComponent(productId)}/attributes`, {
      method: 'PUT',
      body: JSON.stringify({ attributes }),
    }) as Promise<ApiResponse<null>>;
  },
};
