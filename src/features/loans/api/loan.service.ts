export interface LoanApplication { id: string; applicant: string; type: string; status: string; statusTone: string; updated: string; amount?: string; phone?: string; region?: string; loanTerm?: string; formData?: any; }

export interface GetLoansParams {
  page?: number;
  page_size?: number;
  status?: string; // stringified array e.g. '["Draft", "Approved"]'
  loan_amount_min?: string;
  loan_amount_max?: string;
  loan_type?: string;
  mobile_phone?: string;
  from_date?: string;
  to_date?: string;
  search_query?: string;
  tab?: string;
  location?: string;
  lead_id?: string;
}

import { fetchApi } from '@/lib/api/fetchApi';

export const loanService = {
  async getLoans(params?: GetLoansParams): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }

    const path = `oan_a2c.api.v1.loan_applications.get_all_loans?${searchParams.toString()}`;
    return fetchApi(path);
  },

  async getLoanSummary(): Promise<any> {
    return fetchApi('oan_a2c.api.v1.loan_applications.get_loan_summary');
  },

  async getFullProfile(application_id: string): Promise<any> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.get_full_profile?application_id=${application_id}`);
  },

  async getCreditInfo(application_id: string): Promise<any> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.get_credit_info?application_id=${application_id}`);
  },

  async editCreditInfo(data: any): Promise<any> {
    return fetchApi('oan_a2c.api.v1.loan_applications.edit_credit_info', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSupportingDocuments(application_id: string): Promise<any> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.get_supporting_documents?application_id=${application_id}`);
  },




  async uploadSupportingDocument(application_id: string, document_type: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('document_type', document_type);
    formData.append('file', file);

    return fetchApi(`oan_a2c.api.v1.loan_applications.upload_supporting_documents?application_id=${application_id}`, {
      method: 'POST',
      body: formData,
    });
  },

  async listSupportingDocuments(application_id: string): Promise<any> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.get_supporting_documents?application_id=${application_id}`);
  },

  async deleteSupportingDocument(application_id: string, file_id: string): Promise<any> {
    return fetchApi('oan_a2c.api.v1.loan_applications.delete_supporting_document', {
      method: 'POST',
      body: JSON.stringify({ application_id, file_id }),
    });
  },





  async submitApplication(application_id: string): Promise<any> {
    return fetchApi('oan_a2c.api.v1.loan_applications.update_loan_status', {
      method: 'POST',
      body: JSON.stringify({ application_id, status: 'Processing' }),
    });
  },

  async createLoanApplication(lead_id: string): Promise<any> {
    return fetchApi('oan_a2c.api.v1.loan_applications.create_loan_application', {
      method: 'POST',
      body: JSON.stringify({ lead_id: decodeURIComponent(lead_id).replace(/^#/, '') }),
    });
  },

  async updateLoanStatus(application_id: string, status: string): Promise<any> {
    return fetchApi('oan_a2c.api.v1.loan_applications.update_loan_status', {
      method: 'POST',
      body: JSON.stringify({ application_id, status }),
    });
  },

  async updateLoanStep(application_id: string, step: number): Promise<any> {
    return fetchApi('oan_a2c.api.v1.loan_applications.update_loan_step', {
      method: 'POST',
      body: JSON.stringify({ application_id, step }),
    });
  },
};
