

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

// the lead object in the output of Get Leads API 
export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: 'New' | 'Attempted' | 'Connected' | 'Follow Up' | 'Application Started' | 'Application Submitted' | 'Not Interested' | 'Invalid' | string;
  location: string;
  loanType: string;
  loanAmount: string;
  source: string;
  assignedTo?: string;
  owner?: 'me' | 'unassigned' | 'other' | string;
  creation: string;
  farmerPhone?: string;
  [key: string]: any;
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
