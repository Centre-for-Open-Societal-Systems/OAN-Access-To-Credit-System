import type {
    AssignableUser,
    AssignLeadBackendData, GetLeadsParams,
    Lead, LeadStatus, LeadSummaryResponse, RawLead, UpdateLeadStatusResponseData, VisitSchedule
} from '@/features/leads/types/leads.types';
import { httpStatusToErrorCode } from '@/lib/api/apiErrors';
import { logger } from '@/lib/logger';
import { normalizeLeadId } from '@/lib/utils';

// TODO: [OAN-452] The visit-schedules list is fetched independently of leads
// pagination/filters (same start=0&page_length=100 on every call), so it's
// cached + deduped here rather than re-fetched on every getLeads() call (which
// otherwise fired on every pagination, filter, and tab change). Call
// invalidateVisitScheduleCache() after any mutation that changes visit
// schedules. Remove this whole cache once the backend returns
// latest_visit_schedule directly on get_leads.
const VISIT_SCHEDULE_CACHE_TTL_MS = 15_000;
let visitScheduleCache: { promise: Promise<VisitSchedule[]>; timestamp: number } | null = null;

export function invalidateVisitScheduleCache(): void {
  visitScheduleCache = null;
}

// Not tied to any single getLeads() caller's AbortSignal — this is shared,
// cached data, so one superseded lead-list request aborting must not fail it
// for every other caller relying on the same cached promise.
function getVisitSchedules(): Promise<VisitSchedule[]> {
  const isFresh = visitScheduleCache && Date.now() - visitScheduleCache.timestamp < VISIT_SCHEDULE_CACHE_TTL_MS;
  if (isFresh && visitScheduleCache) {
    return visitScheduleCache.promise;
  }

  // Only clear the cache if it's still THIS entry — a slow/failing request
  // must not clobber a newer, valid entry that was created after an
  // explicit invalidateVisitScheduleCache() + fresh successful refetch.
  const invalidateIfCurrent = () => {
    if (visitScheduleCache?.promise === promise) visitScheduleCache = null;
  };
  const promise: Promise<VisitSchedule[]> = fetch(`/api/proxy/v1/visit-schedules?start=0&page_length=100`)
    .then(async (res) => {
      if (!res.ok) {
        // A transient 4xx/5xx isn't a valid "no schedules" result — don't let it
        // poison the cache for the full TTL. This call still resolves to [] (matches
        // the graceful-degradation behavior below) but the next call retries.
        invalidateIfCurrent();
        logger.error(`Failed to fetch visit schedules: HTTP ${res.status}`);
        return [];
      }
      try {
        const json = await res.json() as { data?: VisitSchedule[] };
        return json.data || [];
      } catch (e) {
        logger.error('Failed to parse visit schedules', e);
        return [];
      }
    })
    .catch((e) => {
      // A network-level failure degrades to "no schedules" just like a bad
      // HTTP status, rather than failing the whole leads list — the caller's
      // Promise.all would otherwise reject and blank the entire lead table
      // just because this secondary enrichment call couldn't be reached.
      invalidateIfCurrent();
      logger.error('Failed to fetch visit schedules', e);
      return [];
    });

  visitScheduleCache = { promise, timestamp: Date.now() };
  return promise;
}

export const leadService = {
  async getLeads(params?: GetLeadsParams, signal?: AbortSignal): Promise<{ results: Lead[]; totalCount: number }> {
    const searchParams = new URLSearchParams();
    // Always sent explicitly. Callers that want the first page omit them
    // entirely (useLeadInitialization's direct-link path, for one), and relying
    // on the REST endpoint to default them the same way the old Frappe method
    // did is an assumption this client shouldn't make — an unbounded
    // page_length silently turns a lead lookup into a full-table read.
    searchParams.set('start', params?.start?.toString() ?? '0');
    searchParams.set('page_length', params?.page_length?.toString() ?? '20');
    if (params?.search_query) searchParams.set('search_query', params.search_query);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.lead_source) searchParams.set('lead_source', params.lead_source);
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    // Backend reads min_loan_amount / max_loan_amount (see api-flow-backend.md
    // §4.2 get_leads). Sending min_amount/max_amount is silently ignored — the
    // amount filter is dropped rather than erroring.
    if (params?.min_amount !== undefined) searchParams.set('min_loan_amount', params.min_amount.toString());
    if (params?.max_amount !== undefined) searchParams.set('max_loan_amount', params.max_amount.toString());
    if (params?.loan_type) searchParams.set('loan_type', params.loan_type);
    // Its own param, not folded into search_query: `search_query` only ORs over
    // name/phone/external_id, so appending a region to it guaranteed an empty page.
    if (params?.region) searchParams.set('region', params.region);
    if (params?.assigned_to) searchParams.set('assigned_to', params.assigned_to);
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);

    // TODO: [OAN-452] Temporary client-side join. Visit schedules are cached
    // separately (see getVisitSchedules above) since they're independent of
    // leads pagination/filters — this should be removed once the backend
    // includes latest_visit_schedule in the get_leads response.
    const fetchInit = signal ? { signal } : {};
    const [response, rawSchedules] = await Promise.all([
      fetch(`/api/proxy/v1/leads?${searchParams.toString()}`, fetchInit),
      getVisitSchedules()
    ]);

    if (!response.ok) {
      // 401 logs out, 403 → Access Denied, 5xx → retryable connection error.
      throw new Error(httpStatusToErrorCode(response.status) ?? 'Failed to fetch leads');
    }
    const data = await response.json() as {
      data?: RawLead[];
      pagination?: {
        total?: number;
      };
    };

    const sortedSchedules = [...rawSchedules].sort((a: VisitSchedule, b: VisitSchedule) => {
      const dateA = a.creation || '';
      const dateB = b.creation || '';
      return dateB.localeCompare(dateA);
    });

    // TODO: [OAN-452] This scheduleMap lookup and join is temporary. Once the backend
    // get_leads API returns latest_visit_schedule details directly, we will
    // remove this map, the schedules sorting logic, and the schedulesRes fetch call.
    const scheduleMap = new Map<string, VisitSchedule>();
    for (const s of sortedSchedules) {
      if (s.lead) {
        const key = s.lead.replace('#', '');
        if (!scheduleMap.has(key)) {
          scheduleMap.set(key, s);
        }
      }
    }

    const rawLeads: RawLead[] = data.data || [];
    const totalCount = data.pagination?.total || 0;

    const results = rawLeads.map((item: RawLead): Lead => {
      const leadId = item.name;
      const cleanId = leadId ? leadId.replace('#', '') : '';
      const latestSchedule = scheduleMap.get(cleanId);

      return {
        id: item.name,
        name: item.first_name || item.last_name ? `${item.first_name || ''} ${item.last_name || ''}`.trim() : '',
        firstName: item.first_name || null,
        lastName: item.last_name || null,
        phone: item.phone_number || '',
        status: (latestSchedule && latestSchedule.status === 'Missed' ? 'Active' : (item.status || '')) as LeadStatus,
        location: item.location || '',
        loanType: item.loan_type || '',
        loanAmount: item.loan_amount || '',
        source: item.lead_source || '',
        assignedTo: item.assigned_to,
        owner: item.assigned_to === 'me' ? 'me' : item.assigned_to ? 'other' : 'unassigned',
        creation: item.creation || '',
        external_id: item.external_id,
        visitDate: latestSchedule ? `${latestSchedule.visit_date} ${latestSchedule.visit_time || ''}`.trim() : (item.visitDate || null),
        scheduleStatus: latestSchedule ? (latestSchedule.status || null) : null,
        farmerId: item.farmer_id || null,
        consentDate: item.consent_date || null,
        consentRequestId: item.consentRequestId || null,
      };
    });

    return { results, totalCount };
  },

  async getLeadSummary(): Promise<LeadSummaryResponse> {
    const response = await fetch('/api/proxy/v1/leads/summary');
    if (!response.ok) {
      // 401 logs out, 403 → Access Denied, 5xx → retryable connection error.
      throw new Error(httpStatusToErrorCode(response.status) ?? 'Failed to fetch lead summary');
    }
    const data = await response.json() as { data: LeadSummaryResponse };
    return data.data;
  },

  async updateLeadStatus(lead_id: string, status: string, reason?: string): Promise<UpdateLeadStatusResponseData> {
    const cleanLeadId = encodeURIComponent(normalizeLeadId(lead_id));
    const response = await fetch(`/api/proxy/v1/leads/${cleanLeadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
    });
    if (!response.ok) throw new Error('Failed to update lead status');
    const data = await response.json() as { data: UpdateLeadStatusResponseData };
    return data.data;
  },

  async getAssignableUsers(search_query: string = ''): Promise<AssignableUser[]> {
    const response = await fetch(`/api/proxy/v1/leads/assignable-users?search_query=${encodeURIComponent(search_query)}`);
    if (!response.ok) throw new Error('Failed to fetch assignable users');
    const data = await response.json() as { data: AssignableUser[] };
    return data.data;
  },

  async assignLead(lead_id: string, assigned_to: string): Promise<AssignLeadBackendData> {
    const cleanLeadId = encodeURIComponent(normalizeLeadId(lead_id));
    const response = await fetch(`/api/proxy/v1/leads/${cleanLeadId}/assignment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_to }),
    });
    if (!response.ok) throw new Error('Failed to assign lead');
    const data = await response.json() as { data: AssignLeadBackendData };
    return data.data;
  },
};
