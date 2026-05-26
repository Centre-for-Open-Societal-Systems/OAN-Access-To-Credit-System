export interface LoanApplication {
  id: string;
  applicant: string;
  type: string;
  status: string;
  statusTone: string;
  updated: string;
  amount: string;
  phone: string;
  region: string;
  loanTerm: string;
  formData?: Record<string, any>;
}

export const loanService = {
  async getLoans(): Promise<LoanApplication[]> {
    const response = await fetch('/api/loans');
    if (!response.ok) {
      throw new Error('Failed to fetch loans');
    }
    return response.json();
  },

  async getLoan(id: string): Promise<LoanApplication> {
    const response = await fetch(`/api/loans/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch loan');
    }
    return response.json();
  },

  async updateLoanStatus(id: string, status: string): Promise<LoanApplication> {
    const response = await fetch(`/api/loans/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update loan status');
    }
    return response.json();
  },

  async createLoan(data: Record<string, unknown>): Promise<LoanApplication> {
    const response = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create loan');
    }
    return response.json();
  },
};
