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
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

async function fetchApi(path: string, options: RequestInit = {}) {
  const url = new URL(`/api/proxy/api/method/${path}`, BASE_URL);
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  let responseData;
  try {
    responseData = await response.json();
  } catch (e) {
    if (!response.ok) throw new Error(`API Request failed with status ${response.status}`);
    return null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHORIZED');
    }
    let errorMsg = `API Request failed with status ${response.status}`;
    if (responseData?.message?.message) {
      errorMsg = responseData.message.message;
    } else if (responseData?.message) {
      errorMsg = typeof responseData.message === 'string' ? responseData.message : JSON.stringify(responseData.message);
    } else if (responseData?._server_messages) {
      try {
        const msgs = JSON.parse(responseData._server_messages);
        errorMsg = JSON.parse(msgs[0]).message;
      } catch (e) {}
    }
    throw new Error(errorMsg);
  }

  // Handle Frappe's "200 OK" application-level errors
  if (responseData?.message?.status === 'error') {
    throw new Error(responseData.message.message || 'Application Error');
  }

  return responseData;
}

export const loanService = {
  async getLoans(params?: GetLoansParams): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }

    const path = `oan_a2c.openagrinet_access_to_credit.doctype.loan_application.loan_application.get_loan_applications?${searchParams.toString()}`;
    return fetchApi(path);
  },

  async getLoanSummary(): Promise<any> {
    return fetchApi('oan_a2c.openagrinet_access_to_credit.doctype.loan_application.loan_application.get_loan_summary');
  },

  async saveLoanDetails(data: {
    loan_type: string;
    purpose_of_loan: string;
    requested_loan_amount: number;
    primary_crop: string;
    [key: string]: any;
  }): Promise<any> {
    return fetchApi('oan_a2c.api.loan_app_api.loan_details', {
      method: 'POST',
      body: JSON.stringify({ action: 'save', ...data }),
    });
  },

  async saveBankDetails(data: {
    application_id: string;
    bank_account_name: string;
    bank_account_number: string;
    bank_name: string;
    total_amount_borrowing: number;
    [key: string]: any;
  }): Promise<any> {
    return fetchApi('oan_a2c.api.loan_app_api.bank_details', {
      method: 'POST',
      body: JSON.stringify({ action: 'save', ...data }),
    });
  },

  async saveFarmerDetails(data: {
    application_id: string;
    full_name: string;
    last_name: string;
    mobile_phone: string;
    gender: string;
    woreda: string;
    kebele: string;
    marital_status: string;
    [key: string]: any;
  }): Promise<any> {
    return fetchApi('oan_a2c.api.loan_app_api.farmer_details', {
      method: 'POST',
      body: JSON.stringify({ action: 'save', ...data }),
    });
  },

  async uploadSupportingDocument(application_id: string, document_type: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('application_id', application_id);
    formData.append('document_type', document_type);
    formData.append('file', file);

    return fetchApi('oan_a2c.api.loan_app_api.supporting_documents', {
      method: 'POST',
      body: formData, // FormData doesn't need Content-Type, fetch sets it with boundary
    });
  },

  async listSupportingDocuments(application_id: string): Promise<any> {
    return fetchApi('oan_a2c.api.loan_app_api.supporting_documents', {
      method: 'POST',
      body: JSON.stringify({ action: 'list', application_id }),
    });
  },

  async getConsentData(application_id: string): Promise<any> {
    return fetchApi('oan_a2c.api.loan_app_api.get_consent_data', {
      method: 'POST',
      body: JSON.stringify({ application_id }),
    });
  },

  async sendOtpAndCreateConsent(data: any): Promise<any> {
    return fetchApi('oan_a2c.consent.consent.send_otp_and_create_consent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyOtp(data: { consent_request: string; otp_code: string }): Promise<any> {
    return fetchApi('oan_a2c.consent.consent.verify_otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async reviewApplication(application_id: string): Promise<any> {
    return fetchApi('oan_a2c.api.loan_app_api.application_manager', {
      method: 'POST',
      body: JSON.stringify({ action: 'review', application_id }),
    });
  },

  async submitApplication(application_id: string): Promise<any> {
    return fetchApi('oan_a2c.api.loan_app_api.application_manager', {
      method: 'POST',
      body: JSON.stringify({ action: 'submit', application_id }),
    });
  },

  // Mock implementation for getLoan for now if needed by other components,
  // since a specific get endpoint wasn't provided for a single loan by id.
  async getLoan(id: string): Promise<LoanApplication> {
    const response = await fetch(`/api/loans/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch loan');
    }
    return response.json();
  },

  async updateLoanStatus(id: string, status: string): Promise<any> {
    // Fallback to mock API if production endpoint doesn't exist
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
};
