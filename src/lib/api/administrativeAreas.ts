import { fetchApi } from '@/lib/api/fetchApi';
import type { ApiResponse } from '@/types/api';

export interface AdministrativeArea {
  area_id: string;
  area_name: string;
  level_name: string;
}

interface AreaListData {
  areas?: AdministrativeArea[];
}

// The tree is reference data that changes on a release, not between page views, and a
// cascade re-asks for the same children every time a form reopens.
const cache = new Map<string, Promise<AdministrativeArea[]>>();

/**
 * Children of `parentId`, or the top-level regions when there is none.
 *
 * Failures are dropped from the cache so a retry (reopening the form) can succeed.
 */
export function getAdministrativeAreas(parentId?: string | null): Promise<AdministrativeArea[]> {
  const key = parentId ?? '';
  const hit = cache.get(key);
  if (hit) return hit;

  const query = new URLSearchParams({ limit: '500' });
  if (parentId) query.set('parent', parentId);

  const request = (fetchApi(`v1/administrative-areas?${query.toString()}`) as Promise<ApiResponse<AreaListData>>)
    .then((res) => res.data?.areas ?? [])
    .catch((error) => {
      cache.delete(key);
      throw error;
    });
  cache.set(key, request);
  return request;
}
