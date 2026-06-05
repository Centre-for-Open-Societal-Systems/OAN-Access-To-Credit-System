import type { Lead, GetLeadsParams, GetLeadsResponse, LeadSummaryResponse } from '@/features/leads/types/leads.types';

export const leadService = {
  async getLeads(params?: GetLeadsParams): Promise<GetLeadsResponse> {
    const searchParams = new URLSearchParams({
      start: params?.start?.toString() || '0',
      page_length: params?.page_length?.toString() || '20',
      search_query: params?.search_query || '',
      status: params?.status || '',
      lead_source: params?.lead_source || '',
      start_date: params?.start_date || '',
      end_date: params?.end_date || '',
    });
    if (params?.min_amount !== undefined) {
      searchParams.set('min_amount', params.min_amount.toString());
    }
    if (params?.max_amount !== undefined) {
      searchParams.set('max_amount', params.max_amount.toString());
    }
    if (params?.loan_type !== undefined) {
      searchParams.set('loan_type', params.loan_type);
    }



    const response = await fetch(
      `/api/proxy/api/method/oan_a2c.api.v1.leads.get_leads?${searchParams.toString()}`
    );
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch leads');
    }
    const data = await response.json();

    const rawLeads = data.message?.results || [];
    const totalCount = data.message?.total_count || 0;

    const results = rawLeads.map((item: any): Lead => ({
      id: item.name,
      name: item.farmer_name || item.name,
      phone: item.phone_number || '',
      status: item.status || 'New',
      location: item.location || 'Unknown',
      loanType: item.loan_type || '',
      loanAmount: item.loan_amount || '',
      source: item.lead_source || 'Unknown',
      assignedTo: item.assigned_to,
      owner: item.assigned_to === 'me' ? 'me' : item.assigned_to ? 'other' : 'unassigned',
      creation: item.creation || '',
      external_id: item.external_id,
      visitDate: item.visitDate || null,
      farmerId: item.farmer_id || null,
      consentDate: item.consent_date || null,
      consentRequestId: item.consentRequestId || null,
    }));

    return { results, totalCount };
  },

  async getLeadSummary(): Promise<LeadSummaryResponse> {
    const response = await fetch('/api/proxy/api/method/oan_a2c.api.v1.leads.get_lead_summary');
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch lead summary');
    }
    const data = await response.json();
    return data.message;
  },

  async getLead(id: string): Promise<Lead> {
    const response = await fetch(`/api/leads/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lead');
    }
    return response.json();
  },
};
