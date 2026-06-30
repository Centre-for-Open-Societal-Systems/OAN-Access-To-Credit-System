

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
  // User email to scope the queue, or the literal 'unassigned' for leads with no
  // agent (backend get_leads `assigned_to` filter). Omit for all leads.
  assigned_to?: string | undefined;
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
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  phone: string;
  status: LeadStatus;
  location: string;
  loanType: string;
  loanAmount: string;
  source: string;
  assignedTo?: string | undefined;
  owner?: string | undefined;
  creation: string;
  farmerPhone?: string | undefined;
  visitDate?: string | null | undefined;
  scheduleStatus?: string | null | undefined;
  farmerId?: string | null | undefined;
  consentDate?: string | null | undefined;
  consentRequestId?: string | null | undefined;
  external_id?: string | null | undefined;
  actionType?: string | undefined;
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
  total: number;
  by_status: {
    Open?: number;
    Initiated?: number;
    Qualified?: number;
    'Not Interested'?: number;
    Processed?: number;
    [key: string]: number | undefined;
  };
  // get_lead_summary §4.2: all = total, assigned = leads with an agent (RBAC-scoped
  // to the caller, so effectively "my"), unassigned = all − assigned.
  tab_counts?: {
    all: number;
    assigned: number;
    unassigned: number;
  };
}

export interface VisitSchedule {
  name: string;
  lead?: string;
  visit_date: string;
  visit_time?: string;
  status?: string;
  creation?: string;
}

export interface RawLead {
  name: string;
  farmer_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string;
  status?: string;
  location?: string;
  loan_type?: string;
  loan_amount?: string;
  lead_source?: string;
  assigned_to?: string;
  creation?: string;
  external_id?: string | null;
  visitDate?: string | null;
  farmer_id?: string | null;
  consent_date?: string | null;
  consentRequestId?: string | null;
}

export interface AssignableUser {
  email: string;
  full_name: string;
  agent_id: string;
  region: string;
}

export interface AssignLeadBackendData {
  lead_id: string;
  assigned_to: string;
  assigned_date: string;
}

export interface UpdateLeadStatusResponseData {
  lead_id: string;
  new_status: string;
}

