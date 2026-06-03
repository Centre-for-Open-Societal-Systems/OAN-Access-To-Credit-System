import { fetchApi } from '@/lib/api/fetchApi';

export const newLeadService = {
  // NOTE: duplicated later need to make it universal  
  async sendOtpAndCreateConsent(data: { farmerId: string; phoneNumber?: string }): Promise<any> {
    return fetchApi('oan_a2c.consent.consent.send_otp_and_create_consent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Dummy endpoint for credit info (will be replaced later)
  async getCreditInfo(farmerId: string): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve([]), 500));
  },

  // Dummy endpoint for call details
  async getCallDetails(farmerId: string): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve([]), 500));
  },

  // Dummy endpoint for activities
  async getActivities(leadId: string): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve([]), 500));
  },

  // Dummy endpoint for scheduling visit
  async scheduleVisit(data: { leadId: string; date: string }): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
  },

  // Dummy endpoint for assignment
  async getAssignmentInfo(leadId: string): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve({
      agentId: 'AG-2024-0156',
      assigneeName: 'Sara Bekele',
      region: 'Oromia',
      date: 'May 15, 2026'
    }), 500));
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
    return fetchApi('oan_a2c.api.v1.leads.create_lead', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
