import {
    addCreditInfoResponseSchema, creditInfoApiSchema, validateResponse, type AddCreditInfoResponse, type CreditInfoAPI, 
} from '@/lib/api/api.schemas';
import { fetchApi } from '@/lib/api/fetchApi';
import { normalizeLeadId } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';

export interface FarmerDetails {
  firstName: string;
  lastName: string;
  location: string;
  phoneNumber: string;
  email: string;
  gender?: string | undefined;
  profileImageUrl?: string | undefined;
  websub_delivered_at?: string | undefined;
  consent_type?: string | undefined;
  purpose?: string | undefined;
  validity_from?: string | undefined;
  validity_to?: string | undefined;
  requested_data_fields?: { field_name: string; field_value: string }[] | undefined;
  farmer_profile_created?: boolean | undefined;
  consent_request_status?: string | undefined;
  consent_request_otp_verified?: boolean | undefined;
  consent_request_name?: string | undefined;
  faydaId?: string | undefined;
}

export interface ConsentReason {
  id: number;
  name: string;
  description: string;
}

export interface AllowedDataField {
  id: number;
  name: string;
  code: string;
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
  phone_number: string;
  assigned_to?: string | undefined;
  first_name?: string | undefined;
  last_name?: string | undefined;
}

export interface CallLogAPI {
  source: string;
  ref_id: string;
  received: string;
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
    profile_image_url?: string;
  };
  name?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  location?: string;
  profile_image_url?: string;
}

export interface BasicProfileBackendData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string | null;
  location?: string | null;
  region?: string | null;
  woreda?: string | null;
  kebele?: string | null;
  language?: string | null;
  gender?: string | null;
  websub_delivered_at?: string | null;
  consent_type?: string;
  purpose?: string;
  validity_from?: string;
  validity_to?: string;
  requested_data_fields?: { field_name: string; field_value: string }[];
  farmer_profile_created?: boolean | undefined;
  consent_request?: {
    name?: string;
    status?: string;
    otp_verified?: boolean;
    farmer_fayda_id?: string;
  };
  fayda_id?: string;
}

const cleanId = (id: string): string => encodeURIComponent(normalizeLeadId(id));

export const newLeadService = {
  async searchFarmer(faydaId: string): Promise<FarmerDetails> {
    const response = await fetchApi(`v1/consent/farmers?fayda_id=${encodeURIComponent(faydaId)}`, {
      method: 'GET',
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
        gender: '',
        profileImageUrl: farmerObj.profile_image_url ?? ''
      };
    }
    throw new Error(`Farmer with Fayda ID '${faydaId}' not found.`);
  },


  // Fetch basic details of a consent_request (farmer details, etc.)
  async getLeadDetails(leadId?: string, signal?: AbortSignal): Promise<FarmerDetails> {
    const fetchInit = signal ? { signal } : {};
    const path = leadId
      ? `v1/loan-applications/${cleanId(leadId)}/basic-profile?include_consent_data=1`
      : 'v1/loan-applications/basic-profile?include_consent_data=1';
    const response = await fetchApi(path, fetchInit) as ApiResponse<
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
      firstName: lead.first_name ?? '',
      lastName: lead.last_name ?? '',
      phoneNumber: lead.phone_number ?? '',
      location: lead.region ?? lead.location ?? '',
      email: lead.email ?? '',
      gender: lead.gender ?? '',
      websub_delivered_at: lead.websub_delivered_at ?? '',
      consent_type: lead.consent_type ?? '',
      purpose: lead.purpose ?? '',
      validity_from: lead.validity_from ?? '',
      validity_to: lead.validity_to ?? '',
      requested_data_fields: lead.requested_data_fields ?? [],
      farmer_profile_created: lead.farmer_profile_created,
      consent_request_status: lead.consent_request?.status,
      consent_request_otp_verified: lead.consent_request?.otp_verified,
      consent_request_name: lead.consent_request?.name,
      faydaId: lead.fayda_id ?? lead.consent_request?.farmer_fayda_id ?? ''
    };
  },

  // Fetch the specific lead profile to populate status robustly (especially on page reload)
  async getLeadProfile(leadId: string): Promise<SpecificLeadAPI[]> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`v1/leads?search_query=${cleanLeadId}`) as ApiResponse<Array<{
      name?: string;
      lead_id?: string;
      id?: string;
      status?: string;
      lead_source?: string;
      source?: string;
      assigned_to?: string;
      phone_number?: string;
      first_name?: string;
      last_name?: string;
    }>>;
    const rawResults = response.data || [];

    return rawResults.map((lead) => ({
      lead_id: lead.name || lead.lead_id || lead.id || '',
      status: lead.status || '',
      lead_source: lead.lead_source || lead.source || '',
      phone_number: lead.phone_number || '',
      assigned_to: lead.assigned_to,
      first_name: lead.first_name,
      last_name: lead.last_name
    }));
  },

  // Fetch credit information for a lead
  async getCreditInfo(leadId: string): Promise<CreditInfoAPI[]> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`v1/leads/${cleanLeadId}/credit-info`) as ApiResponse<CreditInfoAPI[]>;
    return validateResponse(z.array(creditInfoApiSchema), response.data, 'leads.get_lead_credit_infos');
  },

  // Add credit information for a lead
  async addCreditInfo(data: { lead_id: string; loan_type?: string; loan_product?: string; loan_amount: number; purpose_message?: string }): Promise<AddCreditInfoResponse> {
    const cleanLeadId = cleanId(data.lead_id);
    const response = await fetchApi(`v1/leads/${cleanLeadId}/credit-info`, {
      method: 'POST',
      body: JSON.stringify({
        loan_type: data.loan_type,
        loan_product: data.loan_product,
        loan_amount: data.loan_amount,
        purpose_message: data.purpose_message,
      }),
    }) as ApiResponse<AddCreditInfoResponse>;
    return validateResponse(addCreditInfoResponseSchema, response.data, 'leads.add_lead_credit_info');
  },

  // Fetch call details for a lead
  async getCallDetails(leadId: string): Promise<GetCallDetailsResponse> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`v1/leads/${cleanLeadId}/call-logs`) as ApiResponse<GetCallDetailsResponse>;
    return response.data;
  },

  // Fetch activities (timeline) for a lead
  async getActivities(leadId: string): Promise<GetActivitiesResponse> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`v1/leads/${cleanLeadId}/timeline`) as ApiResponse<GetActivitiesResponse>;
    return response.data;
  },

  // Add a new note/comment to the lead's timeline
  async addActivityNote(data: { leadId: string; content: string }): Promise<AddActivityNoteResponse> {
    const cleanLeadId = cleanId(data.leadId);
    const response = await fetchApi(`v1/leads/${cleanLeadId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: data.content, content: data.content }),
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
    const response = await fetchApi('v1/visit-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as ApiResponse<ScheduleVisitResponse>;
    return response.data;
  },

  // Fetch visit schedules for a lead
  async getVisitSchedules(leadId: string): Promise<VisitScheduleAPI[]> {
    const cleanLeadId = cleanId(leadId);
    const response = await fetchApi(`v1/visit-schedules?lead_id=${cleanLeadId}&start=0&page_length=50`) as ApiResponse<VisitScheduleAPI[]>;
    return response.data;
  },

  // Update visit schedule status
  async updateVisitScheduleStatus(data: { schedule_id: string; status: string }): Promise<UpdateVisitScheduleStatusResponse> {
    const response = await fetchApi(`v1/visit-schedules/${encodeURIComponent(data.schedule_id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: data.status }),
    }) as ApiResponse<UpdateVisitScheduleStatusResponse>;
    return response.data;
  },

  // Fetch assignable users matching search query
  async getAssignableUsers(searchQuery: string): Promise<AssignableUserAPI[]> {
    const response = await fetchApi(`v1/leads/assignable-users?search_query=${encodeURIComponent(searchQuery)}`) as ApiResponse<AssignableUserAPI[]>;
    return response.data || [];
  },

  // Hit the actual assign_lead API endpoint
  async assignLead(data: { leadId: string; assigneeName: string; assigneeId?: string; email?: string; region?: string }): Promise<AssignLeadResponse> {
    const cleanLeadId = cleanId(data.leadId);
    const response = await fetchApi(`v1/leads/${cleanLeadId}/assignment`, {
      method: 'PATCH',
      body: JSON.stringify({
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
    const response = await fetchApi('v1/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as ApiResponse<CreateLeadResponse>;
    return response.data;
  },

  // Fetch lead metadata (statuses, sources)
  async getLeadMetadata(): Promise<GetLeadMetadataResponse> {
    const response = await fetchApi('v1/leads/metadata') as ApiResponse<GetLeadMetadataResponse>;
    return response.data;
  },

  // Update lead status (e.g. Processed, Rejected)
  async updateLeadStatus(data: { lead_id: string; status: string; reason?: string }): Promise<UpdateLeadStatusResponse> {
    const cleanLeadId = cleanId(data.lead_id);
    const response = await fetchApi(`v1/leads/${cleanLeadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: data.status,
        ...(data.reason ? { reason: data.reason } : {})
      }),
    }) as ApiResponse<UpdateLeadStatusResponse>;
    return response.data;
  }
};
