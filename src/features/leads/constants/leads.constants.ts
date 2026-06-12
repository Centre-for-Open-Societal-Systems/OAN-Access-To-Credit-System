export interface StatusConfig {
  dot: string;
  badge: string;
}


export interface StatusStyle {
  badgeClass: string;
  dotClass: string;
}

export const STATUS_STYLE_MAP: Record<string, StatusStyle> = {
  Active: {
    badgeClass: "bg-green-50 text-green-600 border border-green-200",
    dotClass: "bg-green-500"
  },
  Verified: {
    badgeClass: "bg-teal-50 text-teal-600 border border-teal-200",
    dotClass: "bg-teal-500"
  },
  Processed: {
    badgeClass: "bg-cyan-50 text-cyan-600 border border-cyan-200",
    dotClass: "bg-cyan-500"
  },
  Granted: {
    badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    dotClass: "bg-emerald-500"
  },
  Rejected: {
    badgeClass: "bg-red-50 text-red-500 border border-red-200",
    dotClass: "bg-red-500"
  },
  Dormant: {
    badgeClass: "bg-orange-50 text-orange-500 border border-orange-200",
    dotClass: "bg-orange-500"
  }
};

export const STATUS_OPTS = ['All', 'Active', 'Verified', 'Processed', 'Rejected', 'Dormant'] as const;

export const DATE_OPTS = ['All Time', 'Last 7 Days', 'Last 30 Days', 'This Month'] as const;

export const PAGE_SIZE = 10;


export const KPI_CARDS_LAYOUT = [
  { id: 'total', label: 'Overall Leads' },
  { id: 'active', label: 'Active' },
  { id: 'verified', label: 'Verified' },
  { id: 'processed', label: 'Processed' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'dormant', label: 'Dormant' },
] as const;

export const LEAD_STATUS_MAP: Record<string, string[]> = {
  active: ['Active'],
  verified: ['Verified'],
  processed: ['Processed'],
  granted: ['Granted'],
  rejected: ['Rejected'],
  dormant: ['Dormant'],
};

export const resolveDateFilter = (filterKey: string): { start?: string; end?: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const getPastDate = (days: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const todayStr = today.toISOString().split('T')[0];

  const resolvers: Record<string, () => { start?: string; end?: string }> = {
    'Today': () => ({ start: todayStr, end: todayStr }),
    'Last 7 Days': () => ({ start: getPastDate(6) }),
    'Last 30 Days': () => ({ start: getPastDate(29) }),
    'This Month': () => ({ start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] }),
  };

  return resolvers[filterKey]?.() || {};
};
