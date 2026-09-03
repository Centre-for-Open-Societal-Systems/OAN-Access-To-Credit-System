import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { describe, expect, it } from 'vitest';
import {
  bankApplicationsReducer,
  clearBankFilters,
  selectBankApplicationRows,
  selectBankMetrics,
  selectBankQueryParams,
  selectBankStageCards,
  setBankFilters,
  setBankPage,
  setBankPageSize,
  setBankSearchQuery,
} from './bankApplicationsSlice';

function createTestStore() {
  return configureStore({ reducer: { bankApplications: bankApplicationsReducer } });
}

/** The test store mounts one slice; the selectors are typed against the full RootState. */
const asRootState = (state: { bankApplications: unknown }) => state as unknown as RootState;

const baseFilters = {
  status: [],
  loanType: [],
  loanAmount: [],
  region: '',
  dateFrom: '',
  dateTo: '',
};

describe('selectBankQueryParams', () => {
  it('sends nothing but paging and the default sort when no filter is set', () => {
    const store = createTestStore();

    // Sort is not a filter: newest-first is the list's resting order, so it is
    // sent even with nothing selected. Asserted explicitly rather than allowing
    // extra keys, so a real filter leaking into the default request still fails.
    expect(selectBankQueryParams(asRootState(store.getState()))).toEqual({
      page: 1,
      page_size: 10,
      sort_by: 'creation',
      sort_order: 'desc',
    });
  });

  it('never sends a date window the page has no control for', () => {
    // Any default window would silently hide older applications until someone
    // opens the drawer, so the bank list sends no from_date until one is picked.
    const store = createTestStore();
    const params = selectBankQueryParams(asRootState(store.getState()));

    expect(params.from_date).toBeUndefined();
    expect(params.to_date).toBeUndefined();
  });

  it('sends archetype status values', () => {
    const store = createTestStore();
    store.dispatch({
      type: 'bankApplications/fetchStages/fulfilled',
      payload: [
        {
          name: 'c2f9d14a80',
          bank: 'HDFC Bank',
          stage_id: 'approved-a8f3b2',
          label: 'Approved',
          archetype_state: 'Completed',
          sequence: 1,
          external_code: null,
          description: 'Approved',
          application_count: 14,
        },
        {
          name: 'd3e8c25b91',
          bank: 'HDFC Bank',
          stage_id: 'rejected-b9e4c3',
          label: 'Rejected',
          archetype_state: 'Cancelled',
          sequence: 2,
          external_code: null,
          description: 'Rejected',
          application_count: 20,
        },
      ],
    });
    store.dispatch(setBankFilters({ ...baseFilters, status: ['Approved', 'Rejected'] }));

    expect(selectBankQueryParams(asRootState(store.getState())).status).toBe(
      JSON.stringify(['Approved', 'Rejected'])
    );
  });

  it('collapses selected amount buckets into a single min/max span', () => {
    const store = createTestStore();
    store.dispatch(
      setBankFilters({ ...baseFilters, loanAmount: ['0 - 25,000', '25,001 - 50,000'] })
    );

    const params = selectBankQueryParams(asRootState(store.getState()));
    expect(params.min_loan_amount).toBe('0');
    expect(params.max_loan_amount).toBe('50000');
  });

  it('leaves the range open-ended when the top bucket is selected', () => {
    const store = createTestStore();
    store.dispatch(setBankFilters({ ...baseFilters, loanAmount: ['1,00,000 and above'] }));

    const params = selectBankQueryParams(asRootState(store.getState()));
    expect(params.min_loan_amount).toBe('100001');
    expect(params.max_loan_amount).toBeUndefined();
  });

  it('carries search, loan type, region and dates through', () => {
    const store = createTestStore();
    store.dispatch(setBankSearchQuery('ET-FRM-2026'));
    store.dispatch(
      setBankFilters({
        ...baseFilters,
        loanType: ['Crop Loan', 'Seed Loan'],
        region: 'Oromia',
        dateFrom: '2026-01-01',
        dateTo: '2026-02-01',
      })
    );

    expect(selectBankQueryParams(asRootState(store.getState()))).toMatchObject({
      search_query: 'ET-FRM-2026',
      loan_type: 'Crop Loan,Seed Loan',
      // `region`, not `location`: there is no `location` column on
      // A2C Loan Application, and naming one put it in the WHERE clause.
      region: 'Oromia',
      from_date: '2026-01-01',
      to_date: '2026-02-01',
    });
  });

  it('never sends a location param', () => {
    const store = createTestStore();
    store.dispatch(setBankFilters({ ...baseFilters, region: 'Oromia' }));

    expect(selectBankQueryParams(asRootState(store.getState()))).not.toHaveProperty('location');
  });
});

describe('paging resets', () => {
  it('returns to page 1 when a filter, the page size or the search changes', () => {
    const store = createTestStore();

    store.dispatch(setBankPage(4));
    store.dispatch(setBankFilters({ ...baseFilters, status: ['Completed'] }));
    expect(store.getState().bankApplications.page).toBe(1);

    store.dispatch(setBankPage(4));
    store.dispatch(setBankSearchQuery('abebe'));
    expect(store.getState().bankApplications.page).toBe(1);

    store.dispatch(setBankPage(4));
    store.dispatch(setBankPageSize(50));
    expect(store.getState().bankApplications.page).toBe(1);
  });

  it('clears the search box along with the filters', () => {
    // One "Clear Filters" has to reset every filter surface, or a value the
    // person can no longer see keeps narrowing the request.
    const store = createTestStore();
    store.dispatch(setBankSearchQuery('abebe'));
    store.dispatch(setBankFilters({ ...baseFilters, status: ['Completed'], region: 'Oromia' }));

    store.dispatch(clearBankFilters());

    // Back to the resting request: paging and the default sort, nothing else.
    // Clearing filters must not clear the sort — that is a display preference,
    // not something the person set in the filter drawer.
    expect(selectBankQueryParams(asRootState(store.getState()))).toEqual({
      page: 1,
      page_size: 10,
      sort_by: 'creation',
      sort_order: 'desc',
    });
  });
});

describe('selectBankApplicationRows', () => {
  /** Stand in for a settled fetch; the mapper reads whatever `raw` holds. */
  function seed(store: ReturnType<typeof createTestStore>, row: Record<string, unknown>) {
    store.dispatch({ type: 'bankApplications/fetch/pending', meta: { requestId: 'r1' } });
    store.dispatch({
      type: 'bankApplications/fetch/fulfilled',
      meta: { requestId: 'r1' },
      payload: { data: [row], pagination: { total: 1, total_pages: 1 } },
    });
  }

  it("shows the status directly from the application payload", () => {
    const store = createTestStore();
    seed(store, {
      application_id: 'APP-0001',
      status: 'Credit Committee',
      step: 5,
      loan_amount: 15000,
      loan_type: 'Crop Loan',
      loan_product_name: 'Harvest Plus',
      region: 'Oromia',
      woreda: 'Adama',
      phone_number: '+251911000000',
      creation: '2026-05-28T10:42:00',
      first_name: 'Abebe',
      last_name: 'Girma',
    });

    const rows = selectBankApplicationRows(asRootState(store.getState()));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'APP-0001',
      applicant: 'Abebe Girma',
      initials: 'AG',
      status: 'Credit Committee',
      statusLabel: 'Credit Committee',
      statusTone: 'info',
      // Built from the three hierarchy fields — there is no `location` field to read.
      location: 'Oromia · Adama',
      region: 'Oromia',
      // The LOAN TYPE column filters server-side on `loan_type`, so that — not
      // the product name — has to be what it displays.
      type: 'Crop Loan',
      productName: 'Harvest Plus',
      loanAmount: '15,000',
    });
  });

  it('uses status directly when provided in the payload', () => {
    const store = createTestStore();
    store.dispatch({
      type: 'bankApplications/fetch/pending',
      meta: { requestId: 'r2' },
    });
    store.dispatch({
      type: 'bankApplications/fetch/fulfilled',
      meta: { requestId: 'r2' },
      payload: {
        data: [
          {
            application_id: 'APP-2026-01482',
            status: 'Verified',
            stage_id: 'LSS-00021',
            step: 1,
            lead_id: null,
            loan_amount: 124.0,
            loan_type: null,
            loan_product: 'PROD-PB-0370-01218',
            loan_product_name: '123456',
            phone_number: '+18289997752',
            creation: '2026-08-23T14:37:01.408252+05:30',
          },
        ],
        pagination: { total: 1, total_pages: 1 },
      },
    });

    const rows = selectBankApplicationRows(asRootState(store.getState()));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'APP-2026-01482',
      status: 'Verified',
      statusLabel: 'Verified',
      statusTone: 'info',
    });
  });

  it('formats a $0 loan amount as "0" rather than missing data "—"', () => {
    const store = createTestStore();
    seed(store, {
      application_id: 'APP-0003',
      status: 'Active',
      loan_amount: 0,
      creation: '2026-05-28T10:42:00',
    });

    const rows = selectBankApplicationRows(asRootState(store.getState()));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.loanAmount).toBe('0');
  });

  it('populates dynamic stages and derives stage options', () => {
    const store = createTestStore();
    store.dispatch({
      type: 'bankApplications/fetchStages/fulfilled',
      payload: [
        {
          name: 'c2f9d14a80',
          bank: 'HDFC Bank',
          stage_id: 'submitted-a8f3b2',
          label: 'Submitted',
          archetype_state: 'In Transition',
          sequence: 1,
          external_code: null,
          description: 'Initial application submission',
          application_count: 14,
        },
        {
          name: 'd3e8c25b91',
          bank: 'HDFC Bank',
          stage_id: 'disbursed-b9e4c3',
          label: 'Disbursed',
          archetype_state: 'Completed',
          sequence: 2,
          external_code: null,
          description: 'Loan disbursed',
          application_count: 20,
        },
      ],
    });

    const state = store.getState();
    expect(state.bankApplications.stages).toHaveLength(2);
    expect(state.bankApplications.stages[0]?.label).toBe('Submitted');
    expect(state.bankApplications.stages[1]?.label).toBe('Disbursed');
  });
  it('falls back to the archetype when no bank stage has been applied', () => {
    const store = createTestStore();
    seed(store, {
      application_id: 'APP-0002',
      status: 'Completed',
      step: 6,
      loan_amount: 9000,
      loan_type: 'Seed Loan',
      phone_number: '+251911000001',
      creation: '2026-05-28T10:42:00',
      first_name: 'Bekele',
      last_name: 'Tola',
    });

    expect(selectBankApplicationRows(asRootState(store.getState()))[0]).toMatchObject({
      status: 'Completed',
      statusLabel: 'Completed',
      statusTone: 'success',
      // A dash, not an empty cell: the record genuinely carries no location.
      location: '—',
    });
  });
});

describe('selectBankStageCards & selectBankMetrics', () => {
  it('combines pipeline stages with live summary counts from get_loan_summary', () => {
    const store = createTestStore();

    store.dispatch({
      type: 'bankApplications/fetchStages/fulfilled',
      payload: [
        {
          name: 'stg-1',
          bank: 'Coop Bank',
          stage_id: 'submitted',
          label: 'Submitted',
          archetype_state: 'In Transition',
          sequence: 1,
          application_count: 0,
        },
        {
          name: 'stg-2',
          bank: 'Coop Bank',
          stage_id: 'disbursed',
          label: 'Disbursed',
          archetype_state: 'Completed',
          sequence: 2,
          application_count: 0,
        },
      ],
    });

    store.dispatch({
      type: 'bankApplications/fetchSummary/fulfilled',
      payload: {
        data: {
          total: 2,
          stages: {
            Submitted: 1,
            Disbursed: 1,
          },
        },
      },
    });

    const rootState = asRootState(store.getState());
    const cards = selectBankStageCards(rootState);
    expect(cards).toHaveLength(2);
    expect(cards[0]).toEqual({
      key: 'submitted',
      label: 'Submitted',
      archetype: 'In Transition',
      value: 1,
    });
    expect(cards[1]).toEqual({
      key: 'disbursed',
      label: 'Disbursed',
      archetype: 'Completed',
      value: 1,
    });

    const metrics = selectBankMetrics(rootState);
    expect(metrics).toEqual({
      total: 2,
      inTransition: 1,
      completed: 1,
      cancelled: 0,
    });
  });

  it('disambiguates keys when two stages share the same stage_id or label', () => {
    const store = createTestStore();

    store.dispatch({
      type: 'bankApplications/fetchStages/fulfilled',
      payload: [
        {
          name: 'stg-1',
          bank: 'Bank A',
          stage_id: 'under_review',
          label: 'Under Review',
          archetype_state: 'In Transition',
          sequence: 1,
          application_count: 5,
        },
        {
          name: 'stg-2',
          bank: 'Bank B',
          stage_id: 'under_review',
          label: 'Under Review',
          archetype_state: 'In Transition',
          sequence: 2,
          application_count: 8,
        },
      ],
    });

    const cards = selectBankStageCards(asRootState(store.getState()));
    expect(cards).toHaveLength(2);
    expect(cards[0]?.key).toBe('under_review');
    expect(cards[1]?.key).toBe('under_review-1');
    expect(cards[0]?.key).not.toBe(cards[1]?.key);
  });
});
