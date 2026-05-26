import { Lead } from '@/types/leads.types';

export const leadService = {
  async getLeads(): Promise<Lead[]> {
    const response = await fetch('/api/leads');
    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }
    return response.json();
  },

  async getLead(id: string): Promise<Lead> {
    const response = await fetch(`/api/leads/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lead');
    }
    return response.json();
  },
};
