

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
  // Prefix-matched against `region` on the lead's linked A2C Farmer Profile —
  // A2C Lead itself carries no location. One field, not three: the drawer has a
  // single text box, and `get_leads` ANDs whichever of region/woreda/kebele it is
  // given, so sending one free-text value as all three would match nothing.
  region?: string | undefined;
  // User email to scope the queue, or the literal 'unassigned' for leads with no
  // agent (backend get_leads `assigned_to` filter). Omit for all leads.
  assigned_to?: string | undefined;
  sort_by?: 'loan_amount' | 'creation' | undefined;
  sort_order?: 'asc' | 'desc' | undefined;
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
  statusChangedAt?: string | null | undefined;
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
  /**
   * Keyed by A2C Lead status. These six are the doctype's entire Select list and
   * the backend seeds all of them, so each is present even at zero.
   *
   * The named keys here used to be Open / Initiated / Qualified / Not Interested
   * — none of which are lead statuses. The index signature meant that read
   * cleanly and returned `undefined` forever; it is kept only for forward
   * compatibility, not as licence to invent keys.
   */
  by_status: {
    Active?: number;
    Verified?: number;
    Processed?: number;
    Granted?: number;
    Rejected?: number;
    Dormant?: number;
    [key: string]: number | undefined;
  };
  tab_counts?: {
    all: number;
    my: number;
    unassigned: number;
  };
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
  status_changed_at?: string | null;
  external_id?: string | null;
  visit_date?: string | null;
  schedule_status?: string | null;
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

