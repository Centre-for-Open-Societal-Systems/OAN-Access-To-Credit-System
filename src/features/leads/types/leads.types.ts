

// input for Get Leads API 
export interface GetLeadsParams {
  start?: number;
  page_length?: number;
  search_query?: string;
  status?: string;
  lead_source?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  loan_type?: string;
}

// output for Get Leads API 
export interface GetLeadsResponse {
  results: Lead[];
  totalCount: number;
}

export type LeadStatus = 'Active' | 'Verified' | 'Processed' | 'Granted' | 'Rejected' | 'Dormant';

// the lead object in the output of Get Leads API 
export interface Lead {
  // NOTE: Index signature [key: string]: any was removed to enforce strict type checking.
  // All dynamically accessed properties are explicitly declared below.
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  location: string;
  loanType: string;
  loanAmount: string;
  source: string;
  assignedTo?: string;
  owner?: string;
  creation: string;
  farmerPhone?: string;
  visitDate?: string | null;
  scheduleStatus?: string;
  farmerId?: string;
  consentDate?: string;
  consentRequestId?: string | null;
  external_id?: string | null;
  actionType?: string;
}
// small trend under summary in Leads
export interface KpiStat {
  id: string;
  label: string;
  display: string;
  trend?: string;
  trendUp?: boolean;
}
export interface LeadSummaryResponse {
  status: string;
  total: number;
  by_status: {
    Open?: number;
    Initiated?: number;
    Qualified?: number;
    'Not Interested'?: number;
    Processed?: number;
    [key: string]: number | undefined;
  };
}
