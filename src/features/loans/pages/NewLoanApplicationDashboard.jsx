import { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Download,
  Eye,
  Filter,
  Globe,
  Plus,
  RefreshCw,
  Tag,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  { label: 'Pending Review', value: 'info' },
  { label: 'Approved',       value: 'success' },
  { label: 'Action Required',value: 'danger' },
  { label: 'Draft',          value: 'neutral' },
];

const ALL_STATUS_VALUES = new Set(STATUS_OPTIONS.map((o) => o.value));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readStoredLoans() {
  try {
    return JSON.parse(localStorage.getItem('a2c_submitted_loans') || '[]');
  } catch {
    return [];
  }
}

function fmtAmount(val) {
  if (!val) return '—';
  const n = parseFloat(String(val).replace(/,/g, ''));
  if (isNaN(n)) return val;
  return n.toLocaleString() + ' ETB';
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
const FARMING_PRACTICE_LABELS = {
  usesIrrigation: 'Uses Irrigation', usesImprovedSeeds: 'Uses Improved Seeds',
  usesFertilizers: 'Uses Fertilizers', memberOfCooperative: 'Member of Cooperative',
  improvedSeeds: 'Improved Seeds', fertilizerUse: 'Fertilizer Use',
  irrigation: 'Irrigation', cropRotation: 'Crop Rotation',
  pesticides: 'Pesticides', mechanization: 'Mechanization',
};

const INCOME_FIELDS = [
  { key: 'primaryCropSales',        label: 'Primary Crop Sales' },
  { key: 'livestockSales',          label: 'Livestock Sales' },
  { key: 'secondaryCropSalesIncome',label: 'Secondary Crop Sales' },
  { key: 'farmingIncome',           label: 'Other Farming Income' },
  { key: 'offFarmWage',             label: 'Off-farm / Wage' },
  { key: 'otherIncome',             label: 'Other Income' },
];

const EXPENDITURE_FIELDS = [
  { key: 'foodLivingCosts',         label: 'Food & Living Costs' },
  { key: 'educationCost',           label: 'Education' },
  { key: 'healthCost',              label: 'Health' },
  { key: 'farmingInputsSelf',       label: 'Farming Inputs (Self)' },
  { key: 'existingDebtRepayments',  label: 'Existing Debt Repayments' },
  { key: 'existingLoanRepayments',  label: 'Existing Loan Repayments' },
  { key: 'otherExpenditure',        label: 'Other Expenditure' },
];

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function F({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-[13px] font-semibold text-gray-800 leading-snug">{value || '—'}</span>
    </div>
  );
}

function StatusBadge({ tone, label }) {
  const cls = {
    info:    'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    danger:  'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const dot = {
    info: 'bg-blue-500', success: 'bg-green-500', danger: 'bg-red-500', neutral: 'bg-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cls[tone] || cls.neutral}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[tone] || dot.neutral}`} />
      {label}
    </span>
  );
}

function StepBadge({ children }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#4a7c59] text-white text-[10px] font-bold flex-shrink-0 leading-none">
      {children}
    </span>
  );
}

function SectionHeading({ step, children }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      {step && <StepBadge>{step}</StepBadge>}
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 m-0 leading-none">{children}</h4>
    </div>
  );
}

function MoneyRow({ label, value, isTotal }) {
  if (isTotal) {
    return (
      <div className="flex items-center justify-between pt-2.5 mt-1 border-t-2 border-gray-200 text-[13px] font-bold text-gray-800">
        <span>{label}</span>
        <span>{value}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 text-[12.5px] last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function DetailModal({ app, onClose }) {
  const [tab, setTab] = useState('overview');
  const fd = app.formData || {};

  const activePractices = Object.entries(fd.farmingPractices || {})
    .filter(([, v]) => v)
    .map(([k]) => FARMING_PRACTICE_LABELS[k] || k);

  const totalIncome      = INCOME_FIELDS.reduce((s, f) => s + (parseFloat(fd[f.key]) || 0), 0);
  const totalExpenditure = EXPENDITURE_FIELDS.reduce((s, f) => s + (parseFloat(fd[f.key]) || 0), 0);
  const netCashFlow      = totalIncome - totalExpenditure;

  const TABS = [
    { id: 'overview',   label: 'Overview'        },
    { id: 'applicant',  label: 'Step 1 · Applicant' },
    { id: 'farm',       label: 'Step 3–4 · Farm & Crops' },
    { id: 'loan',       label: 'Step 5 · Loan'   },
    { id: 'finances',   label: 'Step 6 · Finances' },
    { id: 'collateral', label: 'Step 7 · Collateral' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4a7c59]/10 text-[#4a7c59] flex-shrink-0">
              <ClipboardList size={18} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{app.id} · {app.updated}</p>
              <h3 className="text-[15px] font-bold text-gray-900 truncate leading-tight m-0">{app.applicant}</h3>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge tone={app.statusTone} label={app.status} />
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors border-0 cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={15} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center px-3 py-3 text-[11.5px] font-semibold whitespace-nowrap border-0 cursor-pointer border-b-2 -mb-px transition-colors bg-transparent ${
                tab === t.id
                  ? 'text-[#4a7c59] border-[#4a7c59]'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {/* ── Tab body ── */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

          {/* Overview */}
          {tab === 'overview' && (
            <>
              <div className="flex flex-col gap-3">
                <SectionHeading>Application Summary</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Application ID"     value={app.id} />
                  <F label="Loan Type"           value={app.type} />
                  <F label="Requested Amount"    value={fmtAmount(app.amount)} />
                  <F label="Proposed Term"       value={app.proposedLoanTerm ? `${app.proposedLoanTerm} Months` : null} />
                  <F label="Preferred Bank"      value={fd.preferredBank} />
                  <F label="Repayment Frequency" value={fd.repaymentFrequency} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading>Applicant at a Glance</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Full Name"  value={app.applicant} />
                  <F label="Mobile"     value={app.phone} />
                  <F label="Region"     value={app.region || fd.region} />
                  <F label="Gender"     value={fd.gender} />
                  <F label="Education"  value={fd.educationLevel} />
                  <F label="Fayda ID"   value={fd.faydaId} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading>Submission Timeline</SectionHeading>
                <div className="flex flex-col">
                  {[
                    { Icon: Check,        color: 'green', label: 'Application Submitted', sub: app.updated,                            done: true  },
                    { Icon: Clock3,       color: 'blue',  label: 'Under Agent Review',    sub: 'Awaiting Development Agent sign-off',  done: false },
                    { Icon: CheckCircle2, color: 'gray',  label: 'Bank Assessment',       sub: 'Pending financial institution review', done: false },
                    { Icon: CheckCircle2, color: 'gray',  label: 'Decision',              sub: 'Approval or additional info request',  done: false },
                  ].map(({ Icon, color, label, sub, done }, i, arr) => (
                    <div key={label} className="flex items-stretch gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex w-7 h-7 shrink-0 items-center justify-center rounded-full ${done ? (color === 'green' ? 'bg-green-100' : color === 'blue' ? 'bg-blue-100' : 'bg-gray-100') : 'bg-gray-100'}`}>
                          <Icon size={13} strokeWidth={2.5} className={done ? (color === 'green' ? 'text-green-600' : color === 'blue' ? 'text-blue-600' : 'text-gray-400') : 'text-gray-400'} />
                        </div>
                        {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 1 · Applicant */}
          {tab === 'applicant' && (
            <>
              <div className="flex flex-col gap-3">
                <SectionHeading step="1">Personal Information</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Full Name"          value={fd.fullName} />
                  <F label="Father's Name"      value={fd.fatherName} />
                  <F label="Grandfather's Name" value={fd.grandfatherName} />
                  <F label="Date of Birth"      value={fd.dateOfBirth} />
                  <F label="Gender"             value={fd.gender} />
                  <F label="Marital Status"     value={fd.maritalStatus} />
                  <F label="Education Level"    value={fd.educationLevel} />
                  <F label="Mobile Phone"       value={fd.mobilePhone} />
                  <F label="Alternate Phone"    value={fd.alternatePhone} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading step="1">Residential Location</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Region"          value={fd.region} />
                  <F label="Zone"            value={fd.zone} />
                  <F label="Woreda/District" value={fd.woreda} />
                  <F label="Kebele"          value={fd.kebele} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading step="2">KYC / Fayda Identity</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Fayda ID Number"     value={fd.faydaId} />
                  <F label="Verification Status" value={fd.faydaId ? 'OTP Requested' : 'Not Provided'} />
                </div>
              </div>
            </>
          )}

          {/* Steps 3–4 · Farm & Crops */}
          {tab === 'farm' && (
            <>
              <div className="flex flex-col gap-3">
                <SectionHeading step="3">Farm Location</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Region" value={fd.farmRegion} />
                  <F label="Zone"   value={fd.farmZone} />
                  <F label="Woreda" value={fd.farmWoreda} />
                  <F label="Kebele" value={fd.farmKebele} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading step="3">Land Details</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Land Ownership"        value={fd.landOwnership} />
                  <F label="Total Farm Size (ha)"  value={fd.totalFarmSize} />
                  <F label="Land Certificate No."  value={fd.landCertificateNo} />
                  <F label="Distance to Road (km)" value={fd.distanceToRoad} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading step="4">Agricultural Profile</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Primary Crop"         value={fd.primaryCropType} />
                  <F label="Secondary Crop"       value={fd.secondaryCrop} />
                  <F label="Farming Season"       value={fd.farmingSeason} />
                  <F label="Experience (Years)"   value={fd.farmingSeasonYears} />
                  <F label="Expected Yield (Qt.)" value={fd.expectedYield} />
                </div>
              </div>
              {activePractices.length > 0 && (
                <div className="flex flex-col gap-3">
                  <SectionHeading step="4">Farming Practices</SectionHeading>
                  <div className="flex flex-wrap gap-1.5">
                    {activePractices.map((p) => (
                      <span key={p} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#4a7c59]/10 text-[#3a6347] border border-[#4a7c59]/20">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {fd.purposeOfLoan && (
                <div className="flex flex-col gap-2">
                  <SectionHeading>Purpose of Loan (Narrative)</SectionHeading>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">{fd.purposeOfLoan}</p>
                </div>
              )}
            </>
          )}

          {/* Step 5 · Loan */}
          {tab === 'loan' && (
            <>
              <div className="flex flex-col gap-3">
                <SectionHeading step="5">Loan Request</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Loan Type"           value={fd.loanType} />
                  <F label="Requested Amount"    value={fmtAmount(fd.requestedAmount)} />
                  <F label="Proposed Term (mo.)" value={fd.proposedLoanTerm} />
                  <F label="Repayment Frequency" value={fd.repaymentFrequency} />
                  <F label="Loan Purpose"        value={fd.loanPurpose} />
                  <F label="Preferred Bank"      value={fd.preferredBank} />
                </div>
              </div>
              {(fd.requestedAmount && fd.proposedLoanTerm) && (() => {
                const principal = parseFloat(String(fd.requestedAmount).replace(/,/g, '')) || 0;
                const months    = parseInt(fd.proposedLoanTerm) || 0;
                const total     = principal + principal * 0.18 * (months / 12) + principal * 0.02;
                return (
                  <div className="flex flex-col gap-3">
                    <SectionHeading>Estimated Loan Summary</SectionHeading>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 pt-3 pb-2">
                      <MoneyRow label="Principal Amount"       value={fmtAmount(principal)} />
                      <MoneyRow label="Interest Rate (Annual)" value="18%" />
                      <MoneyRow label="Processing Fee"         value="2%" />
                      <MoneyRow isTotal label="Estimated Total Repayment" value={`${total.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB`} />
                    </div>
                  </div>
                );
              })()}
              {fd.detailedUseOfFunds && (
                <div className="flex flex-col gap-2">
                  <SectionHeading>Detailed Use of Funds</SectionHeading>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">{fd.detailedUseOfFunds}</p>
                </div>
              )}
            </>
          )}

          {/* Step 6 · Finances */}
          {tab === 'finances' && (
            <>
              <div className="flex flex-col gap-3">
                <SectionHeading step="6">Annual Income Sources (ETB)</SectionHeading>
                <div className="rounded-xl border border-gray-100 bg-white px-4 pt-3 pb-2">
                  {INCOME_FIELDS.map(({ key, label }) => (
                    <MoneyRow key={key} label={label} value={parseFloat(fd[key]) ? `${Number(fd[key]).toLocaleString()} ETB` : '—'} />
                  ))}
                  <MoneyRow isTotal label="Total Annual Income" value={`${totalIncome.toLocaleString()} ETB`} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading step="6">Annual Household Expenditures (ETB)</SectionHeading>
                <div className="rounded-xl border border-gray-100 bg-white px-4 pt-3 pb-2">
                  {EXPENDITURE_FIELDS.map(({ key, label }) => (
                    <MoneyRow key={key} label={label} value={parseFloat(fd[key]) ? `${Number(fd[key]).toLocaleString()} ETB` : '—'} />
                  ))}
                  <MoneyRow isTotal label="Total Annual Expenditure" value={`${totalExpenditure.toLocaleString()} ETB`} />
                </div>
              </div>
              <div className={`flex items-center justify-between rounded-xl border px-5 py-3.5 ${netCashFlow >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <span className="text-sm font-semibold text-gray-800">Net Cash Flow</span>
                <span className={`text-base font-bold ${netCashFlow >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {netCashFlow >= 0 ? '+' : ''}{netCashFlow.toLocaleString()} ETB
                </span>
              </div>
            </>
          )}

          {/* Step 7 · Collateral */}
          {tab === 'collateral' && (
            <>
              <div className="flex flex-col gap-3">
                <SectionHeading step="7">Collateral Information</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Collateral Type"  value={fd.collateralType} />
                  <F label="Estimated Value"  value={fmtAmount(fd.estimatedValue)} />
                </div>
                {fd.descriptionCondition && (
                  <p className="text-sm text-gray-700 leading-relaxed rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">{fd.descriptionCondition}</p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading step="7">Guarantor 1</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Name"         value={fd.guarantor1Name} />
                  <F label="Relationship" value={fd.guarantor1Relationship} />
                  <F label="Phone"        value={fd.guarantor1Phone} />
                  <F label="Fayda / ID"   value={fd.guarantor1FaydaId} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading step="7">Guarantor 2</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <F label="Name"         value={fd.guarantor2Name} />
                  <F label="Relationship" value={fd.guarantor2Relationship} />
                  <F label="Phone"        value={fd.guarantor2Phone} />
                  <F label="Fayda / ID"   value={fd.guarantor2FaydaId} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <SectionHeading step="8–9">Declaration</SectionHeading>
                {[
                  { label: 'Applicant Declaration signed',          done: fd.declaration   },
                  { label: 'Development Agent verification signed', done: fd.agentVerified },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`flex w-5 h-5 shrink-0 items-center justify-center rounded-full ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Check size={11} strokeWidth={3} className={done ? 'text-green-600' : 'text-gray-400'} />
                    </div>
                    <span className={`text-sm font-medium ${done ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-2 border-t border-gray-100 p-4 flex-shrink-0">
          <button
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ value, label, helper, trendLabel, trendDir, TrendIcon, IconComponent, iconBg, iconColor }) {
  const trendStyle =
    trendDir === 'up'   ? 'bg-green-50 text-green-700' :
    trendDir === 'down' ? 'bg-red-50 text-red-600'     :
                          'bg-gray-100 text-gray-500';
  return (
    <article className="relative bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden">
      {/* Trend badge */}
      <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${trendStyle}`}>
        {TrendIcon && <TrendIcon size={10} strokeWidth={2.5} />}
        {trendLabel}
      </span>

      {/* Body: icon left, value+label right */}
      <div className="flex items-center justify-between mt-6">
        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl flex-shrink-0 ${iconBg}`}>
          <IconComponent size={30} strokeWidth={1.5} className={iconColor} />
        </div>
        <div className="text-right">
          <strong className="block text-[2.4rem] font-bold tracking-tight text-gray-900 leading-none">{value}</strong>
          <span className="block text-sm font-bold text-gray-700 mt-1 leading-tight">{label}</span>
        </div>
      </div>

      {/* Helper footer */}
      <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
        {helper}
      </div>
    </article>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function NewLoanApplicationDashboard() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState(readStoredLoans);
  const [page, setPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(ALL_STATUS_VALUES));
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewApp, setViewApp] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    function onFocus() { setLoans(readStoredLoans()); }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const totalCount    = loans.length;
  const pendingCount  = loans.filter((l) => l.statusTone === 'info').length;
  const approvedCount = loans.filter((l) => l.statusTone === 'success').length;
  const rejectedCount = loans.filter((l) => l.statusTone === 'danger').length;

  const allChecked = selectedStatuses.size === STATUS_OPTIONS.length;

  function toggleStatus(value) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      if (next.size === 0) return new Set(ALL_STATUS_VALUES);
      return next;
    });
    setPage(1);
  }

  function toggleAll() {
    setSelectedStatuses(allChecked ? new Set() : new Set(ALL_STATUS_VALUES));
    setPage(1);
  }

  const filteredLoans = (selectedStatuses.size === 0 || allChecked)
    ? loans
    : loans.filter((l) => selectedStatuses.has(l.statusTone));

  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / PAGE_SIZE));
  const pagedLoans = filteredLoans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !allChecked && selectedStatuses.size > 0;

  const dotColor = { info: 'bg-blue-500', success: 'bg-green-500', danger: 'bg-red-500', neutral: 'bg-gray-400' };

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-0.5 m-0">Loan Applications</h1>
          <p className="text-sm text-gray-400 m-0">All applications submitted via the New Loan Application form.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => { setLoans(readStoredLoans()); setPage(1); }}
          >
            <RefreshCw size={14} strokeWidth={2.3} />
            Refresh
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            type="button"
          >
            <Download size={14} strokeWidth={2.3} />
            Export
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#4a7c59] text-white hover:bg-[#3a6347] transition-colors cursor-pointer border-0"
            onClick={() => navigate('/loans/new')}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Application
          </button>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          value={totalCount}
          label="Total Applications"
          trendLabel="All loan types"
          trendDir={null}
          TrendIcon={Globe}
          IconComponent={ClipboardList}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          helper={<><Globe size={12} strokeWidth={2} className="opacity-60" /><span>All loan types</span></>}
        />
        <KpiCard
          value={approvedCount}
          label="Approved"
          trendLabel={approvedCount > 0 ? `${approvedCount} ready` : '—'}
          trendDir={approvedCount > 0 ? 'up' : null}
          TrendIcon={approvedCount > 0 ? TrendingUp : TrendingDown}
          IconComponent={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          helper={<><Tag size={12} strokeWidth={2} className="opacity-60" /><span>Ready to disburse</span></>}
        />
        <KpiCard
          value={pendingCount}
          label="Pending Review"
          trendLabel={pendingCount > 0 ? `${pendingCount} pending` : '—'}
          trendDir={pendingCount > 0 ? 'up' : null}
          TrendIcon={pendingCount > 0 ? TrendingUp : TrendingDown}
          IconComponent={Clock3}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          helper={<><Calendar size={12} strokeWidth={2} className="opacity-60" /><span>In this period</span></>}
        />
        <KpiCard
          value={rejectedCount}
          label="Rejected"
          trendLabel={rejectedCount > 0 ? `${rejectedCount} flagged` : '—'}
          trendDir={rejectedCount > 0 ? 'down' : null}
          TrendIcon={rejectedCount > 0 ? TrendingDown : TrendingUp}
          IconComponent={CircleAlert}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          helper={<><Clock3 size={12} strokeWidth={2} className="opacity-60" /><span>Needs attention</span></>}
        />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2 m-0">
            <ClipboardList size={16} strokeWidth={2.2} />
            Submitted Applications
            {loans.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                {filteredLoans.length}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                  isFiltered
                    ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                    : filterOpen
                    ? 'bg-[#4a7c59]/5 text-[#4a7c59] border-[#4a7c59]'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter size={12} strokeWidth={2.5} />
                {isFiltered ? `Status (${selectedStatuses.size})` : 'Filter Status'}
                <ChevronDown size={11} strokeWidth={2.5} />
              </button>

              {filterOpen && (
                <div className="absolute top-[calc(100%+6px)] right-0 z-40 min-w-[180px] bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium w-full text-left cursor-pointer border-0 transition-colors ${allChecked ? 'bg-[#4a7c59]/10 text-[#4a7c59] font-semibold' : 'bg-transparent text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${allChecked ? 'bg-[#4a7c59] border-[#4a7c59] text-white' : 'border-gray-300'}`}>
                      {allChecked && <Check size={9} strokeWidth={3} />}
                    </span>
                    All Statuses
                  </button>
                  {STATUS_OPTIONS.map((opt) => {
                    const checked = selectedStatuses.has(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleStatus(opt.value)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium w-full text-left cursor-pointer border-0 transition-colors ${checked ? 'bg-[#4a7c59]/10 text-[#4a7c59] font-semibold' : 'bg-transparent text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${checked ? 'bg-[#4a7c59] border-[#4a7c59] text-white' : 'border-gray-300'}`}>
                          {checked && <Check size={9} strokeWidth={3} />}
                        </span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[opt.value] || 'bg-gray-400'}`} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4a7c59]/10 text-[#4a7c59]">
              <ClipboardList size={28} strokeWidth={1.6} />
            </div>
            <h3 className="text-base font-bold text-gray-800 m-0">No Applications Yet</h3>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed m-0">
              Submitted loan applications will appear here automatically. Start a new application and complete all 9 steps to see it listed.
            </p>
            <button
              className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-lg text-sm font-semibold bg-[#4a7c59] text-white hover:bg-[#3a6347] transition-colors border-0 cursor-pointer"
              onClick={() => navigate('/loans/new')}
            >
              <Plus size={15} strokeWidth={2.5} />
              Start New Application
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Application ID / Applicant', 'Loan Type', 'Amount', 'Region', 'Term', 'Status', 'Date Submitted', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/70 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedLoans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-sm text-gray-400">
                        No applications match the selected filter.
                      </td>
                    </tr>
                  ) : pagedLoans.map((app, idx) => {
                    const isNew = page === 1 && idx < 3 && app.statusTone === 'info';
                    return (
                      <tr
                        key={app.id + idx}
                        className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${isNew ? 'bg-[#4a7c59]/[0.03]' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <strong className={`block text-[13px] font-bold ${isNew ? 'text-[#4a7c59]' : 'text-gray-800'}`}>{app.id}</strong>
                          <span className="text-xs text-gray-400">{app.applicant}</span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">{app.type || '—'}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-gray-800">{fmtAmount(app.amount)}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">{app.region || '—'}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">{app.proposedLoanTerm ? `${app.proposedLoanTerm} mo.` : '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={app.statusTone} label={app.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{app.updated}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setViewApp(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Eye size={12} strokeWidth={2.2} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLoans.length)} of {filteredLoans.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="grid place-items-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Previous"
                  >
                    <ChevronLeft size={13} strokeWidth={2.5} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      aria-current={pg === page ? 'page' : undefined}
                      className={`grid place-items-center min-w-[2rem] h-8 px-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        pg === page
                          ? 'bg-[#4a7c59] border-[#4a7c59] text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    className="grid place-items-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next"
                  >
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail modal ── */}
      {viewApp && <DetailModal app={viewApp} onClose={() => setViewApp(null)} />}
    </div>
  );
}

export default NewLoanApplicationDashboard;
