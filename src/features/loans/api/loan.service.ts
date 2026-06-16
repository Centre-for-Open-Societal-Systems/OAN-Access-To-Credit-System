import { fetchApi } from '@/lib/api/fetchApi';
import { normalizeLeadId } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';

export interface LoanApplication {
  id: string;
  applicant: string;
  type: string;
  status: string;
  statusTone: string;
  updated: string;
  amount?: string;
  phone?: string;
  region?: string;
  loanTerm?: string;
  formData?: any;
}

export interface LoanApplicationSummary {
  application_id: string;
  status: 'Draft' | 'Processing' | 'Approved' | 'Rejected';
  step: number;
  lead_id: string;
  loan_amount: number;
  loan_type: string;
  location: string;
  phone_number: string;
  creation: string;
}

export interface LoanApplicationFull {
  application_id: string;
  lead_id: string;
  status: 'Draft' | 'Processing' | 'Approved' | 'Rejected';
  current_step: number | null;
  farmer_profile: string;
  phone_number: string;
  location: string;
  farmer_id: string;
  consent_id: string;
  loan_type: string;
  loan_amount: number;
  loan_reason: string;
  loan_officer?: string;
  [key: string]: unknown;
}

export interface LoanSummaryMetrics {
  total: number;
  processing: number;
  approved: number;
  rejected: number;
  tab_counts?: {
    all: number;
    my: number;
    unassigned: number;
  };
}

export interface SupportingDocument {
  file_id: string;
  file_name: string;
  document_type: string;
  is_verified?: boolean;
  creation?: string;
  owner?: string;
}

export interface CreateLoanApplicationResponse {
  application_id: string;
  application: {
    name: string;
    status: 'Draft';
    farmer_profile: string;
    first_name: string;
    last_name: string;
    loan_type: string;
    loan_amount: number;
    current_step: number | null;
  };
}


export interface GetLoansParams {
  page?: number;
  page_size?: number;
  search_query?: string; // free-text search by Application ID, Lead ID, or Phone Number
  status?: string; // stringified array or comma-separated statuses e.g. 'Draft,Approved'
  min_loan_amount?: string;
  max_loan_amount?: string;
  loan_type?: string;
  phone_number?: string;
  from_date?: string;
  to_date?: string;
  tab?: string;
  location?: string;
  lead_id?: string;
}

export const loanService = {
  async getLoans(params?: GetLoansParams, options?: RequestInit): Promise<ApiResponse<LoanApplicationSummary[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const path = `oan_a2c.api.v1.loan_applications.get_all_loans?${searchParams.toString()}`;
    return fetchApi(path, options) as Promise<ApiResponse<LoanApplicationSummary[]>>;
  },

  async getLoanSummary(): Promise<ApiResponse<LoanSummaryMetrics>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.get_loan_summary') as Promise<ApiResponse<LoanSummaryMetrics>>;
  },

  async downloadSupportingDocument(file_id: string, view = 0): Promise<null> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.download_supporting_document?file_id=${file_id}&view=${view}`) as Promise<null>;
  },

  async getFullProfile(application_id: string): Promise<ApiResponse<LoanApplicationFull>> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.get_full_profile?application_id=${application_id}`) as Promise<ApiResponse<LoanApplicationFull>>;
  },

  async getSupportingDocuments(application_id: string): Promise<ApiResponse<SupportingDocument[]>> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.get_supporting_documents?application_id=${application_id}`) as Promise<ApiResponse<SupportingDocument[]>>;
  },

  async uploadSupportingDocument(application_id: string, document_type: string, file: File): Promise<ApiResponse<SupportingDocument>> {
    const formData = new FormData();
    formData.append('document_type', document_type);
    formData.append('file', file);

    return fetchApi(`oan_a2c.api.v1.loan_applications.upload_supporting_documents?application_id=${application_id}`, {
      method: 'POST',
      body: formData,
    }) as Promise<ApiResponse<SupportingDocument>>;
  },

  async listSupportingDocuments(application_id: string): Promise<ApiResponse<SupportingDocument[]>> {
    return this.getSupportingDocuments(application_id);
  },

  async deleteSupportingDocument(application_id: string, file_id: string): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.delete_supporting_document', {
      method: 'POST',
      body: JSON.stringify({ application_id, file_id }),
    }) as Promise<ApiResponse<null>>;
  },

  async submitApplication(application_id: string): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.update_loan_status', {
      method: 'POST',
      body: JSON.stringify({ application_id, status: 'Processing' }),
    }) as Promise<ApiResponse<null>>;
  },

  async createLoanApplication(lead_id: string): Promise<ApiResponse<CreateLoanApplicationResponse>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.create_loan_application', {
      method: 'POST',
      body: JSON.stringify({ lead_id: normalizeLeadId(lead_id) }),
    }) as Promise<ApiResponse<CreateLoanApplicationResponse>>;
  },

  async updateLoanStatus(application_id: string, status: string): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.update_loan_status', {
      method: 'POST',
      body: JSON.stringify({ application_id, status }),
    }) as Promise<ApiResponse<null>>;
  },

  async updateLoanStep(application_id: string, step: number): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.update_loan_step', {
      method: 'POST',
      body: JSON.stringify({ application_id, step }),
    }) as Promise<ApiResponse<null>>;
  },

  /**
   * Finds the loan application summary for a given lead ID.
   * Throws an error if no application is found, ensuring the returned value is always defined.
   */
  async findApplicationByLeadId(lead_id: string, options?: RequestInit): Promise<LoanApplicationSummary> {
    const cleanLeadId = normalizeLeadId(lead_id);
    const response = await this.getLoans({ lead_id: cleanLeadId }, options);
    const results = response?.data || [];
    if (results.length === 0) {
      throw new Error(`No loan application found for Lead ID: ${cleanLeadId}`);
    }
    return results[0] as LoanApplicationSummary;
  },

  /**
   * Helper to check if a loan application exists for a lead.
   * Catches the not-found error and returns null, since not having an application is a normal state here.
   */
  async findApplicationIdByLeadId(lead_id: string, options?: RequestInit): Promise<string | null> {
    try {
      const app = await this.findApplicationByLeadId(lead_id, options);
      return app.application_id;
    } catch {
      return null;
    }
  },
};
