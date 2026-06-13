

// input for Get Leads API 
export interface GetLeadsParams {
  start?: number | undefined;
  page_length?: number | undefined;
  search_query?: string | undefined;
  status?: string | undefined;
  lead_source?: string | undefined;
  start_date?: string | undefined;
  end_date?: string | undefined;
  min_amount?: number | undefined;
  max_amount?: number | undefined;
  loan_type?: string | undefined;
}

// output for Get Leads API 
export interface GetLeadsResponse {
  results: Lead[];
  totalCount: number;
}

export type LeadStatus = 'Active' | 'Verified' | 'Processed' | 'Granted' | 'Rejected' | 'Dormant';

// the lead object in the output of Get Leads API 
export interface Lead {
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
