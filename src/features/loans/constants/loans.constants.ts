export interface StatusConfig {
  dot: string;
  badge: string;
  tone: 'success' | 'info' | 'danger' | 'neutral';
}

export const STATUS_CFG: Record<string, StatusConfig> = {
  'Approved':        { dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200',   tone: 'success' },
  'Pending Review':  { dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200',     tone: 'info'    },
  'Action Required': { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-600 border-red-200',        tone: 'danger'  },
  'Draft':           { dot: 'bg-slate-400',  badge: 'bg-slate-50 text-slate-600 border-slate-200',  tone: 'neutral' },
};

// All tabs including "All"
export const LOAN_STATUSES = ['All', 'Pending Review', 'Action Required', 'Approved', 'Draft'] as const;

// Statuses an agent can transition a loan to
export const UPDATABLE_STATUSES = ['Pending Review', 'Action Required', 'Approved', 'Draft'] as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGE_SIZE = 10;

// ─── Loan metadata options ────────────────────────────────────────────────────
export const LOAN_TYPES = [
  'Input Financing',
  'Machinery / Equipment',
  'Conventional',
  'Alhuda (Islamic Financing)',
] as const;

export const REGIONS = ['Oromia', 'Amhara', 'SNNP', 'Tigray', 'Afar', 'Benishangul-Gumuz'] as const;

export const LOAN_TERMS = [
  '6 Months',
  '12 Months (1 Year)',
  '18 Months',
  '24 Months (2 Years)',
  '36 Months (3 Years)',
] as const;

// ─── Reason options per target status ────────────────────────────────────────
export const STATUS_UPDATE_REASONS: Record<string, string[]> = {
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
] as const;

export const STEP_META = [
  { title: 'Loan Details',               subtitle: 'Capture information about the requested loan and farming activities.' },
  { title: 'Bank Details',               subtitle: 'Capture bank account and settlement details for the loan application.' },
  { title: 'Supporting Documents',       subtitle: 'Upload all required supporting documents for the loan application.' },
  { title: 'Consent & OTP Verification', subtitle: "Obtain farmer's consent to access registry data via Fayda OTP." },
  { title: 'Farmer Details',             subtitle: "Please verify or enter the farmer's personal details." },
  { title: 'Review Application',         subtitle: 'Please review all information before final submission. Resolve any warnings or missing info.' },
];

export const GENDER_OPTIONS    = ['Male', 'Female'];
export const MARITAL_OPTIONS   = ['Single', 'Married', 'Divorced', 'Widowed'];
export const EDUCATION_OPTIONS = ['No Formal Education', 'Primary School', 'Secondary School', 'Vocational / TVET', 'Diploma', "Bachelor's Degree", 'Postgraduate'];
export const LOAN_TYPE_OPTIONS = [
  { value: 'input',     label: 'Input Financing',     sub: 'Seeds, fertilizers, chemicals' },
  { value: 'machinery', label: 'Machinery/Equipment',  sub: 'Tractors, harvesters, irrigation' },
  { value: 'conventional', label: 'Conventional', sub: 'Tractors, harvesters, irrigation' },
  { value: 'alhuda', label: 'Alhuda (Islamic Financing)', sub: 'Sharia-compliant agricultural credit' },
];
export const PURPOSE_OPTIONS  = ['Agro-processing (e.g., milling grain)', 'Crop Production', 'Livestock', 'Equipment Purchase', 'Land Development', 'Input Purchase'];
export const DURATION_OPTIONS = ['6 Months', '12 Months (1 Year)', '18 Months', '24 Months (2 Years)', '36 Months (3 Years)'];
export const CROP_OPTIONS     = ['Barley', 'Wheat', 'Soybeans', 'Maize', 'Other Variety'];
export const CROP_VARIETY_OPTIONS = ['Seed + S-Hela/Achen + Stellar Star', 'Hybrid Maize BH-546', 'Soybean Pawe-03', 'Barley HB-1307', 'Other Variety'];
export const OTHER_FARMING_ACTIVITY_OPTIONS = ['Cattle, Poultry, Sheep/Goats, Other Income Sources', 'Cattle', 'Poultry', 'Sheep/Goats', 'Other Income Sources'];
export const HARVEST_AGGREGATOR_OPTIONS = [
  { value: 'primaryCooperative', label: 'Primary Cooperative', sub: 'Member-based produce collection and marketing' },
  { value: 'nucleusFarmer', label: 'Nucleus Farmer', sub: 'Lead farmer coordinating outgrower harvests' },
];
export const FERTILIZER_PRICE_OPTIONS = ['ETB 850 / Bag', 'ETB 900 / Bag', 'ETB 950 / Bag'];
export const AGROCHEMICAL_OPTIONS = ['A', 'B', 'C', 'D'];
export const CROP_PROTECTION_COST_OPTIONS = ['ETB 5,000', 'ETB 10,000', 'ETB 15,000'];
export const DATA_FIELDS      = ['Basic Profile (Required)', 'Phone Number', 'Farm Details & Location'];

export const CONSENT_TYPE_OPTIONS     = ['Specific (Single Farmer)', 'Group', 'Cooperative'];
export const CONSENT_DURATION_OPTIONS = ['6 Months', '12 Months', '18 Months', '24 Months'];
export const LANGUAGE_OPTIONS         = ['Amharic', 'English', 'Oromiffa', 'Tigrinya', 'Somali', 'Other'];
export const SOURCE_OF_INCOME_OPTIONS = ['Salary', 'Farming', 'Business', 'Pension', 'Other'];
export const ID_TYPE_OPTIONS          = ['National ID', 'Passport', 'Kebele ID', 'Driving License'];
export const AGRONOMIC_FARMLAND_OPTIONS = ['Capacity for production', 'Good', 'Average', 'Poor'];
export const LAND_OWNERSHIP_OPTIONS     = ['Security of access', 'Owned', 'Leased', 'Shared'];
export const SOIL_FERTILITY_OPTIONS     = ['Future yield potential', 'High', 'Medium', 'Low'];
export const MOISTURE_LEVEL_OPTIONS     = ['Irrigation / drought risks', 'Well-irrigated', 'Rain-fed', 'Drought-prone'];
