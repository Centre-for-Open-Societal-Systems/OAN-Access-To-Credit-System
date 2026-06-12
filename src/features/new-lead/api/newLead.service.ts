import { fetchApi } from '@/lib/api/fetchApi';

export const newLeadService = {
  async simulateWebhook(lead_id: string): Promise<any> {
    return fetchApi('oan_a2c.api.dev.simulate_webhook', {
      method: 'POST',
      body: JSON.stringify({ lead_id: decodeURIComponent(lead_id).replace(/^#/, '') }),
    });
  },

  async searchFarmer(faydaId: string): Promise<any> {
    return fetchApi('oan_a2c.api.v1.consent.api.search_farmer', {
      method: 'POST',
      body: JSON.stringify({ fayda_id: faydaId }),
    });
  },

  async sendOtpAndCreateConsent(data: { farmerId: string; consentFormFilename: string; consentFormBase64: string; partnerName?: string; leadId?: string }): Promise<any> {
    const cleanLeadId = data.leadId ? decodeURIComponent(data.leadId).replace(/^#/, '') : '';
    const payload = {
      lead_id: cleanLeadId,
      fayda_id: data.farmerId,
      partner: data.partnerName || "AgriBank",
      purpose: "Loan for seeds and fertilizer",
      consent_form_filename: data.consentFormFilename,
      consent_form_base64: data.consentFormBase64,
    };
    return fetchApi('oan_a2c.api.v1.consent.api.request_otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyOtp(data: { leadId?: string; otp_code: string }): Promise<any> {
    if (!data.leadId) {
      throw new Error('leadId is required for OTP verification');
    }
    const cleanLeadId = decodeURIComponent(data.leadId).replace(/^#/, '');
    return fetchApi('oan_a2c.api.v1.consent.api.verify_otp_for_lead', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: cleanLeadId,
        otp_code: data.otp_code
      }),
    });
  },

  // Fetch full details of a lead (farmer details, etc.)
  async getLeadDetails(leadId: string): Promise<any> {
    const cleanLeadId = decodeURIComponent(leadId).replace(/^#/, '');
    return fetchApi(`oan_a2c.api.v1.loan_applications.get_basic_profile?lead_id=${cleanLeadId}`);
  },

  // Fetch the specific lead to populate status robustly (especially on page reload)
  async getSpecificLead(leadId: string): Promise<any> {
    const cleanLeadId = decodeURIComponent(leadId).replace(/^#/, '');
    return fetchApi(`oan_a2c.api.v1.leads.get_leads?search_query=${cleanLeadId}`);
  },
  // Fetch credit information for a lead
  async getCreditInfo(leadId: string): Promise<any> {
    const cleanLeadId = decodeURIComponent(leadId).replace(/^#/, '');
    return fetchApi(`oan_a2c.api.v1.leads.get_lead_credit_infos?lead_id=${cleanLeadId}`);
  },

  // Add credit information for a lead
  async addCreditInfo(data: { lead_id: string; loan_type: string; loan_amount: number | string; purpose_message?: string }): Promise<any> {
    return fetchApi('oan_a2c.api.v1.leads.add_lead_credit_info', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Fetch call details for a lead
  async getCallDetails(leadId: string): Promise<any> {
    const cleanLeadId = decodeURIComponent(leadId).replace(/^#/, '');
    return fetchApi(`oan_a2c.api.v1.leads.get_lead_call_logs?lead_id=${cleanLeadId}`);
  },

  // Fetch activities (timeline) for a lead
  async getActivities(leadId: string): Promise<any> {
    const cleanLeadId = decodeURIComponent(leadId).replace(/^#/, '');
    return fetchApi(`oan_a2c.api.v1.leads.get_lead_timeline?lead_id=${cleanLeadId}`);
  },

  // Add a new note/comment to the lead's timeline
  async addActivityNote(data: { leadId: string; content: string }): Promise<any> {
    const cleanLeadId = decodeURIComponent(data.leadId).replace(/^#/, '');
    if (cleanLeadId === 'new') {
      return new Promise((resolve) => setTimeout(() => resolve({
        status: 'success',
        comment_id: `new-${Date.now()}`
      }), 500));
    }
    return fetchApi(`oan_a2c.api.v1.leads.add_lead_comment`, {
      method: 'POST',
      body: JSON.stringify({ lead_id: cleanLeadId, content: data.content }),
    });
  },

  // Endpoint for scheduling visit
  async scheduleVisit(data: {
    lead_id: string;
    visit_date: string;
    visit_time: string;
    region?: string;
    zone?: string;
    woreda?: string;
    kebele?: string;
    meeting_location?: string;
    notes?: string;
  }): Promise<any> {
    return fetchApi('oan_a2c.api.v1.leads.schedule_visit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Fetch visit schedules for a lead
  async getVisitSchedules(leadId: string): Promise<any> {
    const cleanLeadId = decodeURIComponent(leadId).replace(/^#/, '');
    return fetchApi(`oan_a2c.api.v1.leads.get_visit_schedules?lead_id=${cleanLeadId}&start=0&page_length=50`);
  },

  // Update visit schedule status
  async updateVisitScheduleStatus(data: { schedule_id: string; status: string }): Promise<any> {
    return fetchApi('oan_a2c.api.v1.leads.update_visit_schedule_status', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Fetch assignable users matching search query
  async getAssignableUsers(searchQuery: string): Promise<any> {
    return fetchApi(`oan_a2c.api.v1.leads.get_assignable_users?search_query=${encodeURIComponent(searchQuery)}`);
  },


  // Hit the actual assign_lead API endpoint
  async assignLead(data: { leadId: string; assigneeName: string; assigneeId?: string; email?: string; region?: string }): Promise<any> {
    const cleanLeadId = decodeURIComponent(data.leadId).replace(/^#/, '');
    const response = await fetchApi('oan_a2c.api.v1.leads.assign_lead', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: cleanLeadId,
        assigned_to: data.email || data.assigneeId
      })
    });
    return {
      payload: {
        assigneeId: data.assigneeId,
        assigneeName: data.assigneeName,
        region: data.region,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      },
      response
    };
  },

  // API to create a new lead
  async createLead(data: {
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    lead_source: string;
    external_id?: string;
  }): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve({
      message: { lead_id: `#LD-${Math.floor(Math.random() * 10000)}` }
    }), 1000));
  },

  // Fetch lead metadata (statuses, sources)
  async getLeadMetadata(): Promise<any> {
    return fetchApi('oan_a2c.api.v1.leads.get_lead_metadata');
  },

  // Update lead status (e.g. Processed, Rejected)
  async updateLeadStatus(data: { lead_id: string; status: string; reason?: string }): Promise<any> {
    const cleanLeadId = decodeURIComponent(data.lead_id).replace(/^#/, '');
    return fetchApi('oan_a2c.api.v1.leads.update_lead_status', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: cleanLeadId,
        status: data.status,
        reason: data.reason
      }),
    });
  }
};
