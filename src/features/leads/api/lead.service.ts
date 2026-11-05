import type {
    AssignableUser,
    AssignLeadBackendData, GetLeadsParams, GetLeadsResponse,
    Lead, LeadStatus, LeadSummaryResponse, RawLead, UpdateLeadStatusResponseData
} from '@/features/leads/types/leads.types';
import { httpStatusToErrorCode } from '@/lib/api/apiErrors';
import { normalizeLeadId } from '@/lib/utils';

export const leadService = {
  async getLeads(params?: GetLeadsParams, signal?: AbortSignal): Promise<GetLeadsResponse> {
    const searchParams = new URLSearchParams();
    // Pagination is always sent explicitly, never left to the server's default.
    // Several callers omit it (useLeadInitialization's direct-link path, for
    // one) and just want the first page; pinning 0/20 here means the page size
    // is decided by this client rather than silently changing under it if the
    // endpoint's default ever moves.
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

    const response = await fetch(`/api/proxy/v1/leads?${searchParams.toString()}`, signal ? { signal } : {});

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

    const rawLeads: RawLead[] = data.data || [];
    const totalCount = data.pagination?.total || 0;

    const results = rawLeads.map((item: RawLead): Lead => {
      return {
        id: item.name,
        name: item.first_name || item.last_name ? `${item.first_name || ''} ${item.last_name || ''}`.trim() : '',
        firstName: item.first_name || null,
        lastName: item.last_name || null,
        phone: item.phone_number || '',
        status: (item.schedule_status === 'Missed' ? 'Active' : (item.status || '')) as LeadStatus,
        location: item.location || '',
        loanType: item.loan_type || '',
        loanAmount: item.loan_amount || '',
        source: item.lead_source || '',
        assignedTo: item.assigned_to,
        owner: item.assigned_to === 'me' ? 'me' : item.assigned_to ? 'other' : 'unassigned',
        creation: item.creation || '',
        external_id: item.external_id,
        visitDate: item.visit_date || null,
        scheduleStatus: item.schedule_status || null,
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
