import { fetchApi } from '@/lib/api/fetchApi';

export const newLeadService = {
  // NOTE: duplicated later need to make it universal  
  async sendOtpAndCreateConsent(data: { farmerId: string; phoneNumber?: string }): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve({ 
      success: true, 
      consent_request: `REQ-${Date.now()}`,
      farmer: {
        firstName: 'Abebe',
        lastName: 'Kebede',
        phoneNumber: data.phoneNumber || '+251 911 234 567',
        location: 'Jimma Zone'
      }
    }), 800));
  },

  async verifyOtp(data: { consent_request: string; otp_code: string }): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve({ 
      success: true,
      firstName: 'Abebe',
      lastName: 'Kebede',
      phoneNumber: '+251 911 234 567'
    }), 800));
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

  // Dummy endpoint for assigning lead to an owner
  async assignLead(data: { leadId: string; assigneeName: string; assigneeId?: string; gender?: string }): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, ...data }), 500));
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
  }
};
