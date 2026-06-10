export interface StatusConfig {
  dot: string;
  badge: string;
}

export const STATUS_CFG: Record<string, StatusConfig> = {
  Active:           { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200'         },
  Verified:         { dot: 'bg-green-500',   badge: 'bg-green-50 text-green-700 border-green-200'       },
  Processed:        { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Granted:          { dot: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'    },
  Dormant:          { dot: 'bg-gray-400',    badge: 'bg-gray-50 text-gray-700 border-gray-200'          },
  Rejected:         { dot: 'bg-orange-400',  badge: 'bg-orange-50 text-orange-700 border-orange-200'    },
};

export const STATUS_OPTS = ['All', 'Active', 'Verified', 'Processed', 'Granted', 'Rejected', 'Dormant'] as const;

export const DATE_OPTS = ['All Time', 'Last 7 Days', 'Last 30 Days', 'This Month'] as const;

export const PAGE_SIZE = 10;

export const COL_FILTER_OPTS: Record<string, string[]> = {
  'STATUS':    STATUS_OPTS.filter(o => o !== 'All'),
  'LOAN TYPE': ['Tractor Loan', 'Crop Loan', 'Livestock Loan', 'Other'],
};

export const KPI_CARDS_LAYOUT = [
  { id: 'total',        label: 'Overall Leads' },
  { id: 'active',       label: 'Active'        },
  { id: 'verified',     label: 'Verified'      },
  { id: 'processed',    label: 'Processed'     },
  { id: 'granted',      label: 'Granted'       },
  { id: 'rejected',     label: 'Rejected'      },
  { id: 'dormant',      label: 'Dormant'       },
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
