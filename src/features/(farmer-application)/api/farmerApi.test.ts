import { fetchApi } from '@/lib/api/fetchApi';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCatalog, getProduct } from './farmerApi';

vi.mock('@/lib/api/fetchApi', () => ({ fetchApi: vi.fn() }));

const mockedFetchApi = vi.mocked(fetchApi);

/** The query string getCatalog handed to fetchApi on its last call. */
const lastQuery = () =>
  new URLSearchParams(String(mockedFetchApi.mock.calls.at(-1)?.[0]).split('?')[1] ?? '');

describe('getCatalog — bookmarked-only filter', () => {
  beforeEach(() => {
    mockedFetchApi.mockReset();
    mockedFetchApi.mockResolvedValue({} as never);
  });

  it('sends is_saved=1 when the filter is on', () => {
    // '1' rather than 'true' is arbitrary between the two; what matters is that
    // pydantic's lax mode reads it as True for FarmerCatalogSchema.is_saved.
    void getCatalog({ is_saved: true });

    expect(lastQuery().get('is_saved')).toBe('1');
  });

  it('omits the param entirely when the filter is off', () => {
    // Not `is_saved=0`: the backend branches on truthiness, so an explicit false
    // would work by accident today, but it says "products I have not saved" —
    // and leaving it out is the schema's own "no bookmark filter" default (None).
    void getCatalog({});

    expect(lastQuery().has('is_saved')).toBe(false);
  });

  it('composes with the other catalog filters', () => {
    void getCatalog({ is_saved: true, categories: ['input-loan'], tenure_months: 12, search: 'seed' });

    const q = lastQuery();
    expect(q.get('is_saved')).toBe('1');
    expect(q.get('category')).toBe('input-loan');
    expect(q.get('min_tenure_months')).toBe('12');
    expect(q.get('max_tenure_months')).toBe('12');
    expect(q.get('search')).toBe('seed');
  });

  it('comma-joins several loan types into one category param', () => {
    // A repeated query param would lose all but the last value in Frappe's form
    // parsing; the endpoint reads this one through parse_multi_value.
    void getCatalog({ categories: ['input-loan', 'equipment-loan'] });

    expect(lastQuery().get('category')).toBe('input-loan,equipment-loan');
  });

  it('sends no category param when no loan type is ticked', () => {
    void getCatalog({ categories: [] });

    expect(lastQuery().has('category')).toBe(false);
  });
});

describe('getProduct', () => {
  beforeEach(() => {
    mockedFetchApi.mockReset();
    mockedFetchApi.mockResolvedValue({} as never);
  });

  it('calls v1/banks/me/products/${productId}', async () => {
    await getProduct('prod-123');
    expect(mockedFetchApi).toHaveBeenCalledWith('v1/banks/me/products/prod-123');
  });
});

