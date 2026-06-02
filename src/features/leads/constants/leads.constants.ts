export interface StatusConfig {
  dot: string;
  badge: string;
}

export const STATUS_CFG: Record<string, StatusConfig> = {
  Initiated:    { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200'         },
  Qualified:    { dot: 'bg-green-500',   badge: 'bg-green-50 text-green-700 border-green-200'       },
  Processed:    { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Disqualified: { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200'             },
  Rejected:     { dot: 'bg-orange-400',  badge: 'bg-orange-50 text-orange-700 border-orange-200'    },
};

export const STATUS_OPTS = ['All', 'Initiated', 'Qualified', 'Processed', 'Disqualified', 'Rejected'] as const;

export const DATE_OPTS = ['All Time', 'Last 7 Days', 'Last 30 Days', 'This Month'] as const;

export const PAGE_SIZE = 10;

export const COL_FILTER_OPTS: Record<string, string[]> = {
  'STATUS':          STATUS_OPTS.filter(o => o !== 'All' && o !== 'Disqualified'),
  'CALL START TIME': ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'],
};

export const KPI_CARDS_LAYOUT = [
  { id: 'total',        label: 'Total Applications' },
  { id: 'initiated',    label: 'Initiated'          },
  { id: 'qualified',    label: 'Qualified'          },
  { id: 'disqualified', label: 'Disqualified'       },
  { id: 'processed',    label: 'Processed'          },
  { id: 'rejected',     label: 'Rejected'           },
] as const;

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
