// ─── Status configuration ─────────────────────────────────────────────────────
export const STATUS_CFG = {
  'Approved':        { dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200',   tone: 'success' },
  'Pending Review':  { dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200',     tone: 'info'    },
  'Action Required': { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-600 border-red-200',        tone: 'danger'  },
  'Draft':           { dot: 'bg-slate-400',  badge: 'bg-slate-50 text-slate-600 border-slate-200',  tone: 'neutral' },
};

// All tabs including "All"
export const LOAN_STATUSES = ['All', 'Pending Review', 'Action Required', 'Approved', 'Draft'];

// Statuses an agent can transition a loan to
export const UPDATABLE_STATUSES = ['Pending Review', 'Action Required', 'Approved', 'Draft'];

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGE_SIZE = 10;

// ─── Loan metadata options ────────────────────────────────────────────────────
export const LOAN_TYPES = [
  'Input Financing',
  'Machinery / Equipment',
  'Conventional',
  'Alhuda (Islamic Financing)',
];

export const REGIONS = ['Oromia', 'Amhara', 'SNNP', 'Tigray', 'Afar', 'Benishangul-Gumuz'];

export const LOAN_TERMS = [
  '6 Months',
  '12 Months (1 Year)',
  '18 Months',
  '24 Months (2 Years)',
  '36 Months (3 Years)',
];

// ─── Reason options per target status ────────────────────────────────────────
export const STATUS_UPDATE_REASONS = {
  'Approved': [
    'Meets all criteria',
    'Collateral verified',
    'Credit score passed',
    'Field visit confirmed',
    'Other',
  ],
  'Pending Review': [
    'Awaiting documents',
    'Under credit review',
    'Referred for second opinion',
    'Field visit scheduled',
    'Other',
  ],
  'Action Required': [
    'Missing documents',
    'Incomplete application',
    'Collateral insufficient',
    'Signature required',
    'Other',
  ],
  'Draft': [
    'Returned for corrections',
    'Incomplete submission',
    'Withdrawn by applicant',
    'Other',
  ],
};

// ─── Dashboard date range options ─────────────────────────────────────────────
export const DATE_RANGE_OPTIONS = [
  { label: 'Today',         value: 'today'     },
  { label: 'Yesterday',     value: 'yesterday' },
  { label: 'Last 7 Days',   value: 'last7'     },
  { label: 'Last 30 Days',  value: 'last30'    },
  { label: 'Last 3 Months', value: 'last3m'    },
  { label: 'Last 6 Months', value: 'last6m'    },
  { label: 'Last Year',     value: 'last1y'    },
];
