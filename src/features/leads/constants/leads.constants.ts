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
  },
  Unknown: {
    badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
    dotClass: "bg-gray-400"
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

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const resolveDateFilter = (filterKey: string): { start?: string; end?: string } => {
  const now = new Date();
  
  switch (filterKey) {
    case 'Today': {
      const todayStr = formatLocalDate(now);
      return { start: todayStr, end: todayStr };
    }
    case 'Last 7 Days': {
      const past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      return { start: formatLocalDate(past) };
    }
    case 'Last 30 Days': {
      const past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      return { start: formatLocalDate(past) };
    }
    case 'This Month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: formatLocalDate(firstDay) };
    }
    default:
      return {};
  }
};
