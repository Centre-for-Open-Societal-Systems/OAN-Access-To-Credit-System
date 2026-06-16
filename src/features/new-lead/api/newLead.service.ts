import { fetchApi } from '@/lib/api/fetchApi';
import { normalizeLeadId } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';

export interface FarmerDetails {
  firstName: string;
  lastName: string;
  location: string;
  phoneNumber: string;
  email: string;
  gender?: string;
  websub_delivered_at?: string;
  consent_type?: string;
  purpose?: string;
  validity_from?: string;
  validity_to?: string;
  requested_data_fields?: { field_name: string; field_value: string }[];
}

export interface CreateLeadPayload {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  lead_source: string;
  external_id?: string;
}

export interface CreateLeadResponse {
  status: string;
  lead_id: string;
  message: string;
}

export interface SendOtpAndCreateConsentResponse {
  consent_request: string;
  transaction_id: string;
  masked_phone: string;
}

export interface AssignableUserAPI {
  email: string;
  full_name: string;
  agent_id: string;
  region: string;
}

export interface AssignLeadBackendData {
  lead_id: string;
  assigned_to: string;
  assigned_date: string;
}

export interface AssignLeadResponse {
  payload: {
    assigneeId: string;
    assigneeName: string;
    region: string;
    date: string;
  };
  response: AssignLeadBackendData;
}

export interface SpecificLeadAPI {
  lead_id: string;
  status: string;
  lead_source: string;
  assigned_to?: string | undefined;
}

export interface VerifyOtpResponse {
  consent_request: string;
  openg2p_consent_id: string;
  consent_receipt: string;
  status: string;
}

export interface CreditInfoAPI {
  name: string;
  loan_type: string;
  loan_amount: number;
  purpose_message?: string;
  created_by?: string;
  creation?: string;
}

export interface AddCreditInfoResponse {
  credit_info_id: string;
}

export interface CallLogAPI {
  source: string;
  ref_id: string;
  timestamp: string;
}

export interface GetCallDetailsResponse {
  lead_id: string;
  call_logs: CallLogAPI[];
}

export interface TimelineItemAPI {
  name: string;
  event_type: string;
  event_title: string;
  event_description: string;
  creation: string;
  owner: string;
}

export interface GetActivitiesResponse {
  lead_id: string;
  timeline: TimelineItemAPI[];
}

export interface AddActivityNoteResponse {
  comment_id: string;
}

export interface VisitScheduleAPI {
  name: string;
  lead?: string;
  visit_date: string;
  visit_time: string;
  meeting_location?: string;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  status?: string;
  scheduled_by?: string;
  creation?: string;
}

export interface ScheduleVisitResponse {
  schedule_id: string;
}

export interface UpdateVisitScheduleStatusResponse {
  schedule_id: string;
  new_status: string;
}

export interface GetLeadMetadataResponse {
  statuses: string[];
  sources: string[];
  loan_types: string[];
}

export interface UpdateLeadStatusResponse {
  lead_id: string;
  new_status: string;
}

export interface SearchFarmerBackendData {
  status?: string;
  farmer?: {
    id?: number;
    name?: string;
    mobile?: string;
    phone?: string;
    email?: string;
    location?: string;
  };
  name?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  location?: string;
}

export interface BasicProfileBackendData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string | null;
  location: string | null;
  gender?: string | null;
  websub_delivered_at?: string | null;
  consent_type?: string;
  purpose?: string;
  validity_from?: string;
  validity_to?: string;
  requested_data_fields?: { field_name: string; field_value: string }[];
}

const cleanId = (id: string): string => normalizeLeadId(id);

export const newLeadService = {
  async searchFarmer(faydaId: string): Promise<FarmerDetails> {
    const response = await fetchApi('oan_a2c.api.v1.consent.api.search_farmer', {
      method: 'POST',
      body: JSON.stringify({ fayda_id: faydaId }),
    }) as ApiResponse<SearchFarmerBackendData | null>;

    const payload = response.data;
    if (!payload) {
      throw new Error(`Farmer with Fayda ID '${faydaId}' not found.`);
    }

    const statusVal = payload.status;
    const farmerObj = payload.farmer || payload;

    if (statusVal === 'success' || payload.farmer || farmerObj.name) {
      const nameParts = (farmerObj.name ?? '').split(' ');
      return {
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' ') ?? '',
        phoneNumber: farmerObj.phone ?? farmerObj.mobile ?? '',
        email: farmerObj.email ?? '',
        location: farmerObj.location ?? '',
        gender: ''
      };
    }
    throw new Error(`Farmer with Fayda ID '${faydaId}' not found.`);
  },

  async sendOtpAndCreateConsent(data: { farmerId: string; consentFormFilename: string; consentFormBase64: string; partnerName?: string; leadId?: string }): Promise<SendOtpAndCreateConsentResponse> {
    const cleanLeadId = data.leadId ? cleanId(data.leadId) : '';
    const payload = {
      lead_id: cleanLeadId,
      fayda_id: data.farmerId,
      partner: data.partnerName || "AgriBank",
      purpose: "Loan for seeds and fertilizer",
      consent_form_filename: data.consentFormFilename,
      consent_form_base64: data.consentFormBase64,
    };
    const response = await fetchApi('oan_a2c.api.v1.consent.api.request_otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as ApiResponse<SendOtpAndCreateConsentResponse>;
    return response.data;
  },

  async verifyOtp(data: { leadId?: string; otp_code: string }): Promise<VerifyOtpResponse> {
    if (!data.leadId) {
      throw new Error('leadId is required for OTP verification');
    }
    const cleanLeadId = cleanId(data.leadId);
    const response = await fetchApi('oan_a2c.api.v1.consent.api.verify_otp_for_lead', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: cleanLeadId,
        otp_code: data.otp_code
      }),
    }) as ApiResponse<VerifyOtpResponse>;
    return response.data;
  },

  // Fetch full details of a lead (farmer details, etc.)
  async getLeadDetails(leadId: string): Promise<FarmerDetails> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`oan_a2c.api.v1.loan_applications.get_basic_profile?lead_id=${cleanLeadId}&include_consent_data=1`) as ApiResponse<
      BasicProfileBackendData | null
    >;

    const lead = response.data;
    if (!lead) {
      return {
        firstName: '',
        lastName: '',
        location: '',
        phoneNumber: '',
        email: '',
        gender: ''
      };
    }

    return {
      firstName: lead.first_name,
      lastName: lead.last_name,
      phoneNumber: lead.phone_number,
      location: lead.location ?? '',
      email: lead.email ?? '',
      gender: lead.gender ?? '',
      websub_delivered_at: lead.websub_delivered_at ?? '',
      consent_type: lead.consent_type ?? '',
      purpose: lead.purpose ?? '',
      validity_from: lead.validity_from ?? '',
      validity_to: lead.validity_to ?? '',
      requested_data_fields: lead.requested_data_fields ?? []
    };
  },

  // Fetch the specific lead to populate status robustly (especially on page reload)
  async getSpecificLead(leadId: string): Promise<SpecificLeadAPI[]> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`oan_a2c.api.v1.leads.get_leads?search_query=${cleanLeadId}`) as ApiResponse<Array<{
      name?: string;
      lead_id?: string;
      id?: string;
      status?: string;
      lead_source?: string;
      source?: string;
      assigned_to?: string;
    }>>;
    const rawResults = response.data || [];

    return rawResults.map((lead) => ({
      lead_id: lead.name || lead.lead_id || lead.id || '',
      status: lead.status || '',
      lead_source: lead.lead_source || lead.source || '',
      assigned_to: lead.assigned_to
    }));
  },

  // Fetch credit information for a lead
  async getCreditInfo(leadId: string): Promise<CreditInfoAPI[]> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`oan_a2c.api.v1.leads.get_lead_credit_infos?lead_id=${cleanLeadId}`) as ApiResponse<CreditInfoAPI[]>;
    return response.data;
  },

  // Add credit information for a lead
  async addCreditInfo(data: { lead_id: string; loan_type: string; loan_amount: number; purpose_message?: string }): Promise<AddCreditInfoResponse> {
    const response = await fetchApi('oan_a2c.api.v1.leads.add_lead_credit_info', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as ApiResponse<AddCreditInfoResponse>;
    return response.data;
  },

  // Fetch call details for a lead
  async getCallDetails(leadId: string): Promise<GetCallDetailsResponse> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`oan_a2c.api.v1.leads.get_lead_call_logs?lead_id=${cleanLeadId}`) as ApiResponse<GetCallDetailsResponse>;
    return response.data;
  },

  // Fetch activities (timeline) for a lead
  async getActivities(leadId: string): Promise<GetActivitiesResponse> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`oan_a2c.api.v1.leads.get_lead_timeline?lead_id=${cleanLeadId}`) as ApiResponse<GetActivitiesResponse>;
    return response.data;
  },

  // Add a new note/comment to the lead's timeline
  async addActivityNote(data: { leadId: string; content: string }): Promise<AddActivityNoteResponse> {
    const cleanLeadId = cleanId(data.leadId);
    if (cleanLeadId === 'new') {
      return new Promise((resolve) => setTimeout(() => resolve({
        comment_id: `new-${Date.now()}`
      }), 500));
    }
    const response = await fetchApi(`oan_a2c.api.v1.leads.add_lead_comment`, {
      method: 'POST',
      body: JSON.stringify({ lead_id: cleanLeadId, content: data.content }),
    }) as ApiResponse<AddActivityNoteResponse>;
    return response.data;
  },

  // Endpoint for scheduling visit
  async scheduleVisit(data: {
    lead_id: string;
    visit_date: string;
    visit_time: string;
    region: string;
    zone: string;
    woreda: string;
    kebele: string;
    meeting_location: string;
    notes: string;
  }): Promise<ScheduleVisitResponse> {
    const response = await fetchApi('oan_a2c.api.v1.leads.schedule_visit', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as ApiResponse<ScheduleVisitResponse>;
    return response.data;
  },

  // Fetch visit schedules for a lead
  async getVisitSchedules(leadId: string): Promise<VisitScheduleAPI[]> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`oan_a2c.api.v1.leads.get_visit_schedules?lead_id=${cleanLeadId}&start=0&page_length=50`) as ApiResponse<VisitScheduleAPI[]>;
    return response.data;
  },

  // Update visit schedule status
  async updateVisitScheduleStatus(data: { schedule_id: string; status: string }): Promise<UpdateVisitScheduleStatusResponse> {
    const response = await fetchApi('oan_a2c.api.v1.leads.update_visit_schedule_status', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as ApiResponse<UpdateVisitScheduleStatusResponse>;
    return response.data;
  },

  // Fetch assignable users matching search query
  async getAssignableUsers(searchQuery: string): Promise<AssignableUserAPI[]> {
    const response = await fetchApi(`oan_a2c.api.v1.leads.get_assignable_users?search_query=${encodeURIComponent(searchQuery)}`) as ApiResponse<AssignableUserAPI[]>;
    return response.data || [];
  },

  // Hit the actual assign_lead API endpoint
  async assignLead(data: { leadId: string; assigneeName: string; assigneeId?: string; email?: string; region?: string }): Promise<AssignLeadResponse> {
    const cleanLeadId = cleanId(data.leadId);
    const response = await fetchApi('oan_a2c.api.v1.leads.assign_lead', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: cleanLeadId,
        assigned_to: data.email || data.assigneeId
      })
    }) as ApiResponse<AssignLeadBackendData>;
    return {
      payload: {
        assigneeId: data.assigneeId || '',
        assigneeName: data.assigneeName,
        region: data.region || '',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      },
      response: response.data
    };
  },

  // API to create a new lead
  async createLead(data: CreateLeadPayload): Promise<CreateLeadResponse> {
    const response = await fetchApi('oan_a2c.api.v1.leads.create_lead', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as ApiResponse<CreateLeadResponse>;
    return response.data;
  },

  // Fetch lead metadata (statuses, sources)
  async getLeadMetadata(): Promise<GetLeadMetadataResponse> {
    const response = await fetchApi('oan_a2c.api.v1.leads.get_lead_metadata') as ApiResponse<GetLeadMetadataResponse>;
    return response.data;
  },

  // Update lead status (e.g. Processed, Rejected)
  async updateLeadStatus(data: { lead_id: string; status: string; reason?: string }): Promise<UpdateLeadStatusResponse> {
    const cleanLeadId = cleanId(data.lead_id);
    const response = await fetchApi('oan_a2c.api.v1.leads.update_lead_status', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: cleanLeadId,
        status: data.status,
        reason: data.reason
      }),
    }) as ApiResponse<UpdateLeadStatusResponse>;
    return response.data;
  }
};
