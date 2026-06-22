import { logger } from '@/lib/logger';
import type {
  Lead,
  GetLeadsParams,
  GetLeadsResponse,
  LeadSummaryResponse,
  VisitSchedule,
  RawLead,
  AssignableUser,
  AssignLeadBackendData,
  UpdateLeadStatusResponseData,
  LeadStatus,
} from '@/features/leads/types/leads.types';

export const leadService = {
  async getLeads(params?: GetLeadsParams, signal?: AbortSignal): Promise<GetLeadsResponse> {
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

    // TODO: [OAN-452] Temporary client-side join. We are fetching up to 2000 visit schedules because 
    // the backend get_leads API doesn't currently include the latest visit schedule details.
    // This should be removed once the backend includes latest_visit_schedule in the lead response.
    const fetchInit = signal ? { signal } : {};
    const [response, schedulesRes] = await Promise.all([
      fetch(`/api/proxy/api/method/oan_a2c.api.v1.leads.get_leads?${searchParams.toString()}`, fetchInit),
      fetch(`/api/proxy/api/method/oan_a2c.api.v1.leads.get_visit_schedules?start=0&page_length=100`, fetchInit)
    ]);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch leads');
    }
    const data = await response.json() as {
      message?: {
        data?: RawLead[];
        pagination?: {
          total?: number;
        };
      };
    };

    let schedulesData: {
      message?: {
        data?: VisitSchedule[];
      };
    } | null = null;
    try {
      if (schedulesRes.ok) {
        schedulesData = await schedulesRes.json() as {
          message?: {
            data?: VisitSchedule[];
          };
        };
      }
    } catch (e) {
      logger.error('Failed to parse visit schedules', e);
    }

    const rawSchedules: VisitSchedule[] = schedulesData?.message?.data || [];
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

    const rawLeads: RawLead[] = data.message?.data || [];
    const totalCount = data.message?.pagination?.total || 0;

    const results = rawLeads.map((item: RawLead): Lead => {
      const leadId = item.name;
      const cleanId = leadId ? leadId.replace('#', '') : '';
      const latestSchedule = scheduleMap.get(cleanId);

      return {
        id: item.name,
        name: item.farmer_name || '',
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
    const response = await fetch('/api/proxy/api/method/oan_a2c.api.v1.leads.get_lead_summary');
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch lead summary');
    }
    const data = await response.json() as { message: { data: LeadSummaryResponse } };
    return data.message.data;
  },

  async updateLeadStatus(lead_id: string, status: string, reason?: string): Promise<UpdateLeadStatusResponseData> {
    const response = await fetch('/api/proxy/api/method/oan_a2c.api.v1.leads.update_lead_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id, status, reason }),
    });
    if (!response.ok) throw new Error('Failed to update lead status');
    const data = await response.json() as { message: { data: UpdateLeadStatusResponseData } };
    return data.message.data;
  },

  async getAssignableUsers(search_query: string = ''): Promise<AssignableUser[]> {
    const response = await fetch(`/api/proxy/api/method/oan_a2c.api.v1.leads.get_assignable_users?search_query=${encodeURIComponent(search_query)}`);
    if (!response.ok) throw new Error('Failed to fetch assignable users');
    const data = await response.json() as { message: { data: AssignableUser[] } };
    return data.message.data;
  },

  async assignLead(lead_id: string, assigned_to: string): Promise<AssignLeadBackendData> {
    const response = await fetch('/api/proxy/api/method/oan_a2c.api.v1.leads.assign_lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id, assigned_to }),
    });
    if (!response.ok) throw new Error('Failed to assign lead');
    const data = await response.json() as { message: { data: AssignLeadBackendData } };
    return data.message.data;
  },
};

