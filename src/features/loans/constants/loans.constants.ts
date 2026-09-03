export interface StatusConfig {
  dot: string;
  badge: string;
  tone: LoanStatusTone;
}

export type LoanStatusTone = 'success' | 'info' | 'danger' | 'neutral';

/**
 * The dot and pill classes for each tone — the one place these colours are written.
 *
 * `badge` deliberately omits the `border` utility: every consumer adds it alongside
 * its own radius and padding.
 */
export const TONE_CFG: Record<LoanStatusTone, { dot: string; badge: string }> = {
  neutral: { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 border-slate-200' },
  info:    { dot: 'bg-blue-500',  badge: 'bg-blue-50 text-blue-700 border-blue-200'    },
  success: { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200' },
  danger:  { dot: 'bg-red-500',   badge: 'bg-red-50 text-red-600 border-red-200'       },
};

/**
 * The four states `A2C Loan Application.status` can hold, in lifecycle order.
 *
 * These are the A2C Loan Application Workflow's states — platform constants,
 * identical for every bank. They are the vocabulary of the `archetype` filter only;
 * what a row's badge *says* is `status`, which the backend resolves to the owning
 * bank's own name for the step.
 *
 * `get_all_loans` validates `status` against exactly this list and answers 400 for
 * anything else, so no other value may ever be used as a filter value. The names
 * this file used to carry — Processing / Approved / Pending Review / Action Required
 * / Draft — are from the model the archetype refactor replaced, and every list that
 * offered them filtered the dashboard into a validation error.
 */
export const LOAN_ARCHETYPE_STATUSES = ['Active', 'In Transition', 'Completed', 'Cancelled'] as const;

export type LoanArchetypeStatus = (typeof LOAN_ARCHETYPE_STATUSES)[number];

export const STATUS_CFG: Record<string, StatusConfig> = {
  'Active':        { ...TONE_CFG.neutral, tone: 'neutral' },
  'In Transition': { ...TONE_CFG.info,    tone: 'info'    },
  'Completed':     { ...TONE_CFG.success, tone: 'success' },
  'Cancelled':     { ...TONE_CFG.danger,  tone: 'danger'  },
};

/** Dot + pill classes for a row, from the tone its mapper already computed. */
export function loanToneCfg(tone: string | undefined): { dot: string; badge: string } {
  return TONE_CFG[(tone ?? '') as LoanStatusTone] ?? TONE_CFG.neutral;
}

/** Tone for a row, from its archetype status. Unknown values read as neutral. */
export function loanStatusTone(status: string | undefined): LoanStatusTone {
  return STATUS_CFG[status ?? '']?.tone ?? 'neutral';
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGE_SIZE = 10;
// ─── Loan amount buckets ──────────────────────────────────────────────────────
// Moved to `@/lib/loanAmountRanges` so the leads filters can share them too — a
// feature may not import another feature's internals. Re-exported here so the
// existing loans/bank-agent call sites keep importing from one place.
export {
  ALL_AMOUNTS_INDEX,
  LOAN_AMOUNT_BUCKET_LABELS,
  LOAN_AMOUNT_RANGES,
  loanAmountCeilingLabel,
  loanAmountRange,
  loanAmountRangeIndex,
} from '@/lib/loanAmountRanges';

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

// ─── Dashboard date range options ─────────────────────────────────────────────
// Deliberately absent. A preset-window dropdown used to be declared here, never
// rendered, while loanDashboardSlice defaulted to 'last30' — so applications older
// than a month were unreachable with nothing on screen to explain the gap. The
// From/To + quick-date control inside <LoanAdvancedFilters/> is the one date filter,
// and it shows what it is doing.

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

// ─── Advanced-filter status options ──────────────────────────────────────────
// Both bank portals and the dev-agent dashboard open the same <LoanAdvancedFilters/>
// drawer over the same slice; only the slice of the lifecycle each one can act on
// differs. Keeping these lists here — instead of a private copy of the whole
// drawer per portal — is what stops them drifting apart again: previously the
// seller copy had picked up two fixes (Clear-all refreshing the table, and the
// active-filter count) that the dev-agent copy never received.
export interface FilterStatusOption {
  /** What the business calls the status. */
  label: string;
  /** The status value the API filters on. */
  value: string;
  dot: string;
}

const statusOption = (status: LoanArchetypeStatus): FilterStatusOption => ({
  label: status,
  value: status,
  dot: STATUS_CFG[status]?.dot ?? 'bg-slate-400',
});

/**
 * Status options for lists that can see the whole lifecycle — the development-agent
 * dashboard and the farmer's own applications.
 *
 * Derived from the archetype list rather than hand-written: the two lists that used to
 * live here differed only in which pre-archetype names they guessed at, and both made
 * `get_all_loans` answer 400.
 */
export const LOAN_FILTER_STATUS_OPTIONS: readonly FilterStatusOption[] =
  LOAN_ARCHETYPE_STATUSES.map(statusOption);

// There is deliberately no bank-side counterpart to the list above.
//
// The bank portals filter on their own pipeline, read live from the store and
// passed to the drawer as `statusOptions`. A stage label is tenant free text and
// `get_all_loans` 400s on anything the caller's stages do not define, so a fixed
// bank list could only ever be a filter that empties the table.

