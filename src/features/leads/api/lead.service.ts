import type { Lead, GetLeadsParams, GetLeadsResponse } from '@/features/leads/types/leads.types';

export const leadService = {
  async getLeads(params?: GetLeadsParams): Promise<GetLeadsResponse> {
    const url = new URL(
      '/api/proxy/api/method/oan_a2c.api.v1.leads.get_leads',
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );
    
    url.searchParams.append('start', params?.start?.toString() || '0');
    url.searchParams.append('page_length', params?.page_length?.toString() || '20');
    url.searchParams.append('search_query', params?.search_query || '');
    url.searchParams.append('status', params?.status || '');
    url.searchParams.append('lead_source', params?.lead_source || '');
    url.searchParams.append('start_date', params?.start_date || '');
    url.searchParams.append('end_date', params?.end_date || '');
    if (params?.assigned_to !== undefined) {
      url.searchParams.append('assigned_to', params.assigned_to);
    }

    const response = await fetch(url.toString());
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
      name: item.name,
      phone: item.phone_number || '',
      status: item.status || 'New',
      location: item.location || 'Unknown',
      cropFocus: item.crop_focus || 'Unknown',
      farmSize: item.farm_size || 'Unknown',
      source: item.lead_source || 'Unknown',
      assignedTo: item.assigned_to,
      owner: item.assigned_to === 'me' ? 'me' : item.assigned_to ? 'other' : 'unassigned',
      callStartTime: item.creation,
      external_id: item.external_id,
    }));

    return { results, totalCount };
  },

  async getLeadSummary(): Promise<any> {
    const url = new URL(
      '/api/proxy/api/method/oan_a2c.api.v1.leads.get_lead_summary',
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );
    const response = await fetch(url.toString());
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
