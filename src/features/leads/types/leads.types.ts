export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: 'New' | 'Attempted' | 'Connected' | 'Follow Up' | 'Application Started' | 'Application Submitted' | 'Not Interested' | 'Invalid' | string;
  location: string;
  cropFocus: string;
  farmSize: string;
  source: string;
  assignedTo?: string;
  owner?: 'me' | 'unassigned' | 'other' | string;
  callStartTime?: string;
  [key: string]: any;
}

export interface KpiStat {
  id: string;
  label: string;
  display: string;
  trend?: string;
  trendUp?: boolean;
}

export interface GetLeadsParams {
  start?: number;
  page_length?: number;
  search_query?: string;
  status?: string;
  lead_source?: string;
  start_date?: string;
  end_date?: string;
}
