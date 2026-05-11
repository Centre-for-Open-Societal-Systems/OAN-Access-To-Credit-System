import { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  ChevronDown,
  Info,
  Cloud,
  MapPin,
  Upload,
  Eye,
  Crosshair,
  Search,
  Fingerprint,
  FileText,
  Image,
  PenLine,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, shortLabel: 'Applicant Personal Details' },
  { number: 2, shortLabel: 'KYC Identification (Fayda OTP)' },
  { number: 3, shortLabel: 'Farm Location & Land Details' },
  { number: 4, shortLabel: 'Agricultural Profile' },
  { number: 5, shortLabel: 'Loan Request Details' },
  { number: 6, shortLabel: 'Household Income & Expenditure' },
  { number: 7, shortLabel: 'Collateral & Guarantor' },
  { number: 8, shortLabel: 'Document Upload & Declaration' },
  { number: 9, shortLabel: 'Final Review' },
];

const STEP_META = [
  { title: 'Start New Application', subtitle: 'Basic farmer information and contact details' },
  { title: 'KYC Identification (Fayda OTP)', subtitle: 'Digital Identity verification via Fayda ID' },
  { title: 'Farm Location & Land Details', subtitle: 'GPS coordinates and land ownership information' },
  { title: 'Agricultural Profile', subtitle: 'Farming activities and crop information' },
  { title: 'Loan Request Details', subtitle: 'Loan amount, purpose, and terms' },
  { title: 'Household Income & Expenditure', subtitle: 'Financial capacity assessment' },
  { title: 'Collateral & Guarantor', subtitle: 'Financial capacity assessment' },
  { title: 'Document Upload & Declaration', subtitle: 'Supporting documents and final consent' },
  { title: 'Final Review', subtitle: 'Review and submit your loan application' },
];

// ─── Option lists ─────────────────────────────────────────────────────────────
const GENDER_OPTIONS = ['Male', 'Female'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const EDUCATION_OPTIONS = [
  'No Formal Education', 'Primary School', 'Secondary School',
  'Vocational / TVET', 'Diploma', "Bachelor's Degree", 'Postgraduate',
];
const REGION_OPTIONS = [
  'Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Afar', 'Somali',
  'Benishangul-Gumuz', 'Gambela', 'Harari', 'Dire Dawa', 'Sidama', 'Southwest Ethiopia',
];
const LAND_OWNERSHIP_OPTIONS = ['Owned', 'Leased', 'Communal', 'Family'];
const CROP_OPTIONS = ['Wheat', 'Maize', 'Teff', 'Barley', 'Sorghum', 'Coffee', 'Chat', 'Sesame', 'Sunflower'];
const FARMING_SEASON_OPTIONS = ['Meher', 'Belg', 'Irrigated Year-Round'];
const YEARS_OPTIONS = ['1', '2', '3', '5', '10', 'More than 10'];
const LOAN_TYPE_OPTIONS = ['Input Financing', 'Equipment Financing', 'Land Development', 'Working Capital', 'Emergency Loan'];
const REPAYMENT_OPTIONS = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'];
const LOAN_PURPOSE_OPTIONS = ['Crop Production', 'Livestock', 'Equipment Purchase', 'Land Development', 'Input Purchase'];
const LOAN_TERM_OPTIONS = ['3', '6', '12', '18', '24', '36'];
const BANK_OPTIONS = [
  'Commercial Bank of Ethiopia', 'Cooperative Bank of Oromia',
  'Awash Bank', 'Amhara Bank', 'Dashen Bank',
];
const COLLATERAL_TYPE_OPTIONS = ['Land / Property', 'Livestock', 'Equipment', 'Vehicle', 'Savings / Deposit', 'Other'];
const RELATIONSHIP_OPTIONS = ['Spouse', 'Parent', 'Sibling', 'Neighbor', 'Friend', 'Other'];

const INCOME_FIELDS = [
  { key: 'primaryCropSales', label: 'Primary Crop Sales' },
  { key: 'livestockSales', label: 'Livestock Sales' },
  { key: 'secondaryCropSalesIncome', label: 'Secondary Crop Sales' },
  { key: 'farmingIncome', label: 'Farming Income' },
  { key: 'offFarmWage', label: 'Off-farm / Wage' },
  { key: 'otherIncome', label: 'Other Income (Remittances, etc.)' },
];

const EXPENDITURE_FIELDS = [
  { key: 'foodLivingCosts', label: 'Food & Living Costs' },
  { key: 'educationCost', label: 'Education' },
  { key: 'healthCost', label: 'Health' },
  { key: 'farmingInputsSelf', label: 'Farming Inputs (Self-funded)' },
  { key: 'existingDebtRepayments', label: 'Existing Debt Repayments' },
  { key: 'existingLoanRepayments', label: 'Existing Loan Repayments' },
  { key: 'otherExpenditure', label: 'Other Expenditure', wide: true },
];

const FARMING_PRACTICES = [
  { key: 'usesIrrigation', label: 'Uses Irrigation' },
  { key: 'usesImprovedSeeds', label: 'Uses Improved Seeds' },
  { key: 'usesFertilizers', label: 'Uses Fertilizers' },
  { key: 'memberOfCooperative', label: 'Member of Cooperative' },
  { key: 'improvedSeeds', label: 'Improved seeds' },
  { key: 'fertilizerUse', label: 'Fertilizer use' },
  { key: 'irrigation', label: 'Irrigation' },
  { key: 'cropRotation', label: 'Crop rotation' },
  { key: 'pesticides', label: 'Pesticides' },
  { key: 'mechanization', label: 'Mechanization' },
];

// ─── Step validation ──────────────────────────────────────────────────────────
function validateStep(_step, _form) {
  return {};
}

// ─── Reusable field components ────────────────────────────────────────────────
function SelectField({ id, label, placeholder, options, value, onChange, required, error }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm shadow-sm focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
              : 'border-border-subtle bg-white focus:border-button focus:ring-button/20'
          }`}
          style={{ color: value ? '#1a1f2e' : '#6e7684' }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span
          className={`pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <ChevronDown size={15} />
        </span>
      </div>
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextField({ id, label, placeholder, value, onChange, type = 'text', hint, required, readOnly, error, max, min }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        max={max}
        min={min}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-2 ${
          readOnly
            ? 'border-border-subtle bg-gray-50 text-text-muted cursor-default focus:border-border-subtle focus:ring-0'
            : error
            ? 'border-red-400 bg-red-50/40 text-text-primary focus:border-red-400 focus:ring-red-100'
            : 'border-border-subtle bg-white text-text-primary focus:border-button focus:ring-button/20'
        }`}
      />
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextAreaField({ id, label, placeholder, value, onChange, required, rows = 4, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        rows={rows}
        className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
            : 'border-border-subtle bg-white focus:border-button focus:ring-button/20'
        }`}
      />
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function NumberField({ id, label, value, onChange, required, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
            : 'border-border-subtle bg-white focus:border-button focus:ring-button/20'
        }`}
      />
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ form, setField, errors }) {
  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
  const minDob = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-base font-semibold text-text-primary">Applicant Personal Details</h2>
        <span className="text-xs text-text-muted">All fields required</span>
      </div>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="fullName" label="Full Name" placeholder="e.g. Tilahun" value={form.fullName} onChange={setField('fullName')} required error={errors.fullName} />
          <TextField id="fatherName" label="Father's Name" placeholder="e.g. Alemu" value={form.fatherName} onChange={setField('fatherName')} required error={errors.fatherName} />
          <TextField id="grandfatherName" label="Grandfather's Name" placeholder="e.g. Kebede" value={form.grandfatherName} onChange={setField('grandfatherName')} required error={errors.grandfatherName} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="dateOfBirth" label="Date of Birth" placeholder="mm/dd/yyyy" type="date" value={form.dateOfBirth} onChange={setField('dateOfBirth')} required error={errors.dateOfBirth} max={maxDob} min={minDob} />
          <SelectField id="gender" label="Gender" placeholder="Select Gender" options={GENDER_OPTIONS} value={form.gender} onChange={setField('gender')} required error={errors.gender} />
          <SelectField id="maritalStatus" label="Marital Status" placeholder="Select Marital Status" options={MARITAL_OPTIONS} value={form.maritalStatus} onChange={setField('maritalStatus')} required error={errors.maritalStatus} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="mobilePhone" label="Mobile Phone" placeholder="Enter Mobile No." type="tel" value={form.mobilePhone} onChange={setField('mobilePhone')} hint="Ethiopian mobile number (+251...)" required error={errors.mobilePhone} />
          <TextField id="alternatePhone" label="Alternate Phone" placeholder="Enter Mobile No." type="tel" value={form.alternatePhone} onChange={setField('alternatePhone')} hint="Ethiopian mobile number (+251...)" required error={errors.alternatePhone} />
          <SelectField id="educationLevel" label="Education Level" placeholder="Select Education" options={EDUCATION_OPTIONS} value={form.educationLevel} onChange={setField('educationLevel')} required error={errors.educationLevel} />
        </div>
        <div className="pt-2">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Location Details</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField id="region" label="Region" value={form.region} readOnly />
              <TextField id="zone" label="Zone" value={form.zone} readOnly />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField id="woreda" label="Woreda / District" value={form.woreda} readOnly />
              <TextField id="kebele" label="Kebele" placeholder="Enter Kebele" value={form.kebele} onChange={setField('kebele')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ form, setField, errors }) {
  const otpRefs = useRef([]);

  function handleOtpChange(index, value) {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...form.otpCode];
    newOtp[index] = value;
    setField('otpCode')(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !form.otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  return (
    <>
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Internet connection required</p>
          <p className="text-xs text-amber-700">Fayda ID verification needs an active connection. Connect to the internet to send the OTP.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
          <h2 className="font-display text-base font-semibold text-text-primary">KYC Identification (Fayda)</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Pending Verification</span>
        </div>
        <div className="flex flex-wrap justify-center gap-10 md:gap-14">
          {/* Left: Fayda ID entry */}
          <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-border-subtle bg-white px-8 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-border-subtle bg-gray-50">
              <Fingerprint size={30} className="text-[#1a2332]" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-text-primary">Verify Identity</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                Enter the applicant's 12-digit Fayda National ID number to request a verification OTP.
              </p>
            </div>
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Fayda ID Number</label>
              <input
                type="text"
                placeholder="XXXX - XXXX - XXXX"
                value={form.faydaId}
                onChange={(e) => setField('faydaId')(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-center text-sm tracking-widest shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                  errors.faydaId
                    ? 'border-red-400 bg-red-50/40 text-text-primary focus:border-red-400 focus:ring-red-100'
                    : 'border-border-subtle bg-white text-text-primary focus:border-button focus:ring-button/20'
                }`}
              />
              {errors.faydaId && <p className="mt-1 text-xs text-red-500">{errors.faydaId}</p>}
            </div>
            <button className="w-full rounded-lg bg-[#1a2332] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a3342]">
              Request OTP
            </button>
          </div>

          {/* Right: OTP entry */}
          <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-xl border border-border-subtle bg-white px-8 py-8">
            <div className="text-center">
              <h3 className="text-base font-semibold text-text-primary">Enter OTP Code</h3>
              <p className="mt-1 text-xs text-text-muted">Code sent to registered mobile ending in ****567</p>
            </div>
            <div className="flex justify-center gap-2 sm:gap-3">
              {form.otpCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-12 rounded-lg border border-border-subtle bg-white text-center text-xl font-semibold text-text-primary shadow-sm focus:border-button focus:outline-none focus:ring-2 focus:ring-button/20"
                />
              ))}
            </div>
            <button className="w-full rounded-lg bg-[#1a2332] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a3342]">
              Verify Identity
            </button>
            <p className="text-center text-xs text-text-muted">
              Didn't receive code?{' '}
              <button className="font-semibold text-[#1a2332] hover:underline">Resend OTP</button>
            </p>
            <div className="flex w-full items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <Info size={14} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-blue-800">Offline Fallback Available</p>
                <p className="text-xs text-blue-700">If OTP fails due to network issues, you can proceed with manual document upload in Step 3.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({ form, setField, errors }) {
  return (
    <>
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Internet connection required</p>
          <p className="text-xs text-amber-700">Fayda ID verification needs an active connection. Connect to the internet to send the OTP.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
          <h2 className="font-display text-base font-semibold text-text-primary">Farm Location & Land Details</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Pending Verification</span>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-text-primary">Current Geolocation</h3>
            {/* Search bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  defaultValue="Bishoftu, East Shewa, Oromia, Ethiopia"
                  className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-8 pr-3 text-sm text-text-primary shadow-sm focus:border-button focus:outline-none focus:ring-2 focus:ring-button/20"
                />
              </div>
              <button className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#1a2332] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#2a3342]">
                <Search size={13} /> Search
              </button>
              <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50">
                <Crosshair size={13} className="text-blue-600" /> GPS
              </button>
            </div>
            {/* OSM-style street map */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200" style={{ height: '405px' }}>
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 540 285" preserveAspectRatio="xMidYMid slice">
                {/* OSM tile background */}
                <rect width="540" height="285" fill="#eae6df" />
                {/* ── Building blocks (tan/cream rectangles) ── */}
                <rect x="8"   y="8"   width="68" height="40" rx="1" fill="#d9d4cb" />
                <rect x="84"  y="8"   width="52" height="40" rx="1" fill="#d5cfca" />
                <rect x="8"   y="54"  width="60" height="32" rx="1" fill="#d9d4cb" />
                <rect x="76"  y="56"  width="58" height="28" rx="1" fill="#d5cfca" />
                <rect x="8"   y="92"  width="68" height="36" rx="1" fill="#d9d4cb" />
                <rect x="84"  y="94"  width="50" height="32" rx="1" fill="#d5cfca" />
                <rect x="8"   y="156" width="66" height="38" rx="1" fill="#d9d4cb" />
                <rect x="82"  y="160" width="52" height="34" rx="1" fill="#d5cfca" />
                <rect x="8"   y="202" width="64" height="40" rx="1" fill="#d9d4cb" />
                <rect x="80"  y="206" width="54" height="36" rx="1" fill="#d5cfca" />
                <rect x="8"   y="250" width="76" height="28" rx="1" fill="#d9d4cb" />
                <rect x="398" y="8"   width="62" height="40" rx="1" fill="#d9d4cb" />
                <rect x="468" y="8"   width="64" height="40" rx="1" fill="#d5cfca" />
                <rect x="400" y="54"  width="58" height="32" rx="1" fill="#d9d4cb" />
                <rect x="466" y="56"  width="66" height="28" rx="1" fill="#d5cfca" />
                <rect x="400" y="92"  width="64" height="36" rx="1" fill="#d9d4cb" />
                <rect x="472" y="94"  width="60" height="32" rx="1" fill="#d5cfca" />
                <rect x="398" y="156" width="64" height="38" rx="1" fill="#d9d4cb" />
                <rect x="470" y="160" width="62" height="34" rx="1" fill="#d5cfca" />
                <rect x="400" y="202" width="62" height="40" rx="1" fill="#d9d4cb" />
                <rect x="470" y="206" width="62" height="36" rx="1" fill="#d5cfca" />
                <rect x="396" y="252" width="72" height="26" rx="1" fill="#d9d4cb" />
                <rect x="164" y="8"   width="88" height="60" rx="1" fill="#d9d4cb" />
                {/* Park / green area (top-center-right) */}
                <rect x="282" y="6"   width="104" height="62" rx="3" fill="#c8e6b0" />
                <rect x="288" y="10"  width="94"  height="54" rx="2" fill="#b6d89c" />
                {/* Center-mid blocks */}
                <rect x="164" y="156" width="86"  height="40" rx="1" fill="#d5cfca" />
                <rect x="282" y="156" width="102" height="40" rx="1" fill="#d9d4cb" />
                <rect x="166" y="204" width="82"  height="40" rx="1" fill="#d9d4cb" />
                <rect x="284" y="206" width="100" height="38" rx="1" fill="#d5cfca" />
                <rect x="166" y="252" width="80"  height="26" rx="1" fill="#d9d4cb" />
                <rect x="286" y="254" width="98"  height="24" rx="1" fill="#d5cfca" />
                {/* Small water body */}
                <ellipse cx="44" cy="260" rx="34" ry="17" fill="#aad3df" opacity="0.9" />
                {/* ── Road casings ── */}
                <path d="M 0,258 L 540,50"     stroke="#c09800" strokeWidth="14" fill="none" />
                <rect x="0"   y="134" width="540" height="14" fill="#c0bab2" />
                <rect x="263" y="0"   width="14"  height="285" fill="#c0bab2" />
                <rect x="0"   y="76"  width="256" height="9"  fill="#cac4bc" />
                <rect x="277" y="76"  width="263" height="9"  fill="#cac4bc" />
                <rect x="0"   y="200" width="256" height="9"  fill="#cac4bc" />
                <rect x="277" y="200" width="263" height="9"  fill="#cac4bc" />
                <rect x="147" y="0"   width="9"   height="127" fill="#cac4bc" />
                <rect x="147" y="148" width="9"   height="137" fill="#cac4bc" />
                <rect x="384" y="0"   width="9"   height="127" fill="#cac4bc" />
                <rect x="384" y="148" width="9"   height="137" fill="#cac4bc" />
                {/* ── Road fills ── */}
                <path d="M 0,258 L 540,50"     stroke="#fbbf24" strokeWidth="9" fill="none" />
                <rect x="0"   y="137" width="540" height="8"   fill="#ffffff" />
                <rect x="266" y="0"   width="8"   height="285" fill="#ffffff" />
                <rect x="0"   y="78"  width="256" height="5"   fill="#ffffff" />
                <rect x="277" y="78"  width="263" height="5"   fill="#ffffff" />
                <rect x="0"   y="202" width="256" height="5"   fill="#ffffff" />
                <rect x="277" y="202" width="263" height="5"   fill="#ffffff" />
                <rect x="149" y="0"   width="5"   height="127" fill="#ffffff" />
                <rect x="149" y="148" width="5"   height="137" fill="#ffffff" />
                <rect x="386" y="0"   width="5"   height="127" fill="#ffffff" />
                <rect x="386" y="148" width="5"   height="137" fill="#ffffff" />
                {/* Tertiary lanes */}
                <line x1="0"   y1="36"  x2="140" y2="36"  stroke="#f0ece5" strokeWidth="3" />
                <line x1="156" y1="36"  x2="256" y2="36"  stroke="#f0ece5" strokeWidth="3" />
                <line x1="277" y1="36"  x2="378" y2="36"  stroke="#f0ece5" strokeWidth="3" />
                <line x1="393" y1="36"  x2="540" y2="36"  stroke="#f0ece5" strokeWidth="3" />
                <line x1="55"  y1="84"  x2="55"  y2="127" stroke="#f0ece5" strokeWidth="3" />
                <line x1="55"  y1="148" x2="55"  y2="194" stroke="#f0ece5" strokeWidth="3" />
                <line x1="478" y1="84"  x2="478" y2="127" stroke="#f0ece5" strokeWidth="3" />
                <line x1="478" y1="148" x2="478" y2="194" stroke="#f0ece5" strokeWidth="3" />
                <line x1="220" y1="84"  x2="220" y2="127" stroke="#f0ece5" strokeWidth="3" />
                <line x1="220" y1="148" x2="220" y2="194" stroke="#f0ece5" strokeWidth="3" />
                <line x1="322" y1="84"  x2="322" y2="127" stroke="#f0ece5" strokeWidth="3" />
                <line x1="322" y1="148" x2="322" y2="194" stroke="#f0ece5" strokeWidth="3" />
                {/* Road labels */}
                <text x="20"  y="133" fontSize="7.5" fill="#888" fontFamily="sans-serif">Meskel Square Rd</text>
                <text x="400" y="133" fontSize="7.5" fill="#888" fontFamily="sans-serif">Adama Road</text>
                <text x="36"  y="247" fontSize="7"   fill="#8a6800" fontFamily="sans-serif" transform="rotate(-9,36,247)">Ring Road</text>
                {/* Area labels */}
                <text x="290" y="134" fontSize="9"   fill="#aaa"     fontFamily="sans-serif" fontStyle="italic">Bishoftu</text>
                <text x="88"  y="186" fontSize="8"   fill="#bbb"     fontFamily="sans-serif">Tulubo</text>
                <text x="400" y="184" fontSize="8"   fill="#bbb"     fontFamily="sans-serif">Hora Arsedi</text>
                <text x="296" y="44"  fontSize="8"   fill="#5a8840"  fontFamily="sans-serif" fontStyle="italic">Hora Park</text>
                {/* Blue Leaflet teardrop pin */}
                <ellipse cx="270" cy="160" rx="8" ry="4" fill="rgba(0,0,0,0.18)" />
                <path d="M270,120 C254,120 242,132 242,147 C242,161 270,163 270,163 C270,163 298,161 298,147 C298,132 286,120 270,120 Z" fill="#2563eb" />
                <circle cx="270" cy="145" r="9" fill="white" />
              </svg>
              {/* Zoom controls */}
              <div className="absolute left-2.5 top-2.5 flex flex-col overflow-hidden rounded border border-gray-300 shadow-sm">
                <button className="flex h-6 w-6 items-center justify-center border-b border-gray-300 bg-white text-sm font-bold leading-none text-gray-700 hover:bg-gray-50">+</button>
                <button className="flex h-6 w-6 items-center justify-center bg-white text-sm font-bold leading-none text-gray-600 hover:bg-gray-50">−</button>
              </div>
              {/* Coordinates */}
              <div className="absolute bottom-1.5 left-2 flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-[10.5px] text-gray-600 shadow-sm">
                <MapPin size={9} className="text-blue-600" /> 9.0054, 38.7649
              </div>
              {/* Attribution */}
              <div className="absolute bottom-1.5 right-1.5 rounded bg-white/95 px-1.5 py-0.5 text-[9.5px] text-gray-500 shadow-sm">
                🟦 Leaflet | © OpenStreetMap contributors
              </div>
            </div>
            {/* Instructions */}
            <p className="text-[11px] leading-relaxed text-gray-500">
              Instructions: Click anywhere on the map to set location, use the GPS button to get current location, or search for an address. You can add custom pins using the + button and edit or delete them as needed.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-text-primary">Farm Location & Land Details</h3>
              <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"><Cloud size={11} /> Offline Ready</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField id="farmRegion" label="Region" placeholder="Select Region" options={REGION_OPTIONS} value={form.farmRegion} onChange={setField('farmRegion')} required error={errors.farmRegion} />
              <TextField id="farmZone" label="Zone" placeholder="Enter Zone" value={form.farmZone} onChange={setField('farmZone')} required error={errors.farmZone} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField id="farmWoreda" label="Woreda" placeholder="Enter Woreda" value={form.farmWoreda} onChange={setField('farmWoreda')} required error={errors.farmWoreda} />
              <TextField id="farmKebele" label="Kebele" placeholder="Enter Kebele" value={form.farmKebele} onChange={setField('farmKebele')} required error={errors.farmKebele} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField id="landOwnership" label="Land Ownership" placeholder="Select Land Ownership" options={LAND_OWNERSHIP_OPTIONS} value={form.landOwnership} onChange={setField('landOwnership')} required error={errors.landOwnership} />
              <TextField id="totalFarmSize" label="Total Farm Size (Hectares)" placeholder="e.g. 2.5" value={form.totalFarmSize} onChange={setField('totalFarmSize')} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField id="landCertificateNo" label="Land Certificate No." placeholder="e.g. LC-00123" value={form.landCertificateNo} onChange={setField('landCertificateNo')} required error={errors.landCertificateNo} />
              <TextField id="distanceToRoad" label="Distance to Nearest Main Road (km)" placeholder="e.g. 5" value={form.distanceToRoad} onChange={setField('distanceToRoad')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Land Certificate Upload</label>
              <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border-subtle bg-gray-50 px-4 py-5 text-center">
                <Cloud size={22} className="text-text-muted" />
                <p className="text-xs font-medium text-text-primary">Click or drag document to upload</p>
                <p className="text-xs text-text-muted">PDF, JPG or PNG (Max 5MB)</p>
                <p className="flex items-center gap-1 text-xs text-blue-600"><MapPin size={10} /> Use camera for offline capture</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────
function Step4({ form, setField, errors }) {
  function togglePractice(key) {
    setField('farmingPractices')({ ...form.farmingPractices, [key]: !form.farmingPractices[key] });
  }
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-base font-semibold text-text-primary">Agricultural Profile</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Pending Verification</span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-primary">Primary Crops</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="primaryCropType" label="Primary Crop Type" placeholder="Select Primary Crop Type" options={CROP_OPTIONS} value={form.primaryCropType} onChange={setField('primaryCropType')} required error={errors.primaryCropType} />
            <SelectField id="secondaryCrop" label="Secondary Crop (Optional)" placeholder="Select Secondary Crop" options={CROP_OPTIONS} value={form.secondaryCrop} onChange={setField('secondaryCrop')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="farmingSeason" label="Farming Season" placeholder="Select Farming Season" options={FARMING_SEASON_OPTIONS} value={form.farmingSeason} onChange={setField('farmingSeason')} required error={errors.farmingSeason} />
            <SelectField id="farmingSeasonYears" label="Farming Experience (Years)" placeholder="Select Years" options={YEARS_OPTIONS} value={form.farmingSeasonYears} onChange={setField('farmingSeasonYears')} required error={errors.farmingSeasonYears} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="farmingSeasonYears2" label="Farming Season Years" placeholder="Select Years" options={YEARS_OPTIONS} value={form.farmingSeasonYears2} onChange={setField('farmingSeasonYears2')} />
            <TextField id="expectedYield" label="Expected Yield (Quintals)" placeholder="e.g. 50" value={form.expectedYield} onChange={setField('expectedYield')} />
          </div>
          <TextAreaField id="purposeOfLoan" label="Purpose of Loan (Detailed)" placeholder="Describe exactly how the funds will be used..." value={form.purposeOfLoan} onChange={setField('purposeOfLoan')} rows={4} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Farming Practices (select all that apply)</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-1">
            {FARMING_PRACTICES.map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={form.farmingPractices[key]} onChange={() => togglePractice(key)} className="h-4 w-4 rounded border-border-subtle text-button focus:ring-button/20" />
                <span className="text-sm text-text-primary">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────
function Step5({ form, setField, errors }) {
  const principal = form.requestedAmount ? parseFloat(String(form.requestedAmount).replace(/,/g, '')) : null;
  const termMonths = form.proposedLoanTerm ? parseInt(form.proposedLoanTerm) : null;
  let totalRepayment = null;
  if (principal && !isNaN(principal) && termMonths) {
    totalRepayment = principal + principal * 0.18 * (termMonths / 12) + principal * 0.02;
  }
  function fmtETB(n) {
    return n != null ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' ETB' : '-- ETB';
  }
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-base font-semibold text-text-primary">Loan Request Details</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"><Cloud size={11} /> Offline Ready</span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="loanType" label="Loan Type" placeholder="Select Loan Type" options={LOAN_TYPE_OPTIONS} value={form.loanType} onChange={setField('loanType')} required error={errors.loanType} />
            <TextField id="requestedAmount" label="Requested Amount (ETB)" placeholder="e.g. 25000" value={form.requestedAmount} onChange={setField('requestedAmount')} required error={errors.requestedAmount} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="repaymentFrequency" label="Repayment Frequency" placeholder="Select Frequency" options={REPAYMENT_OPTIONS} value={form.repaymentFrequency} onChange={setField('repaymentFrequency')} required error={errors.repaymentFrequency} />
            <SelectField id="loanPurpose" label="Loan Purpose" placeholder="Select Loan Purpose" options={LOAN_PURPOSE_OPTIONS} value={form.loanPurpose} onChange={setField('loanPurpose')} required error={errors.loanPurpose} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="proposedLoanTerm" label="Proposed Loan Term (Months)" placeholder="Select Loan Term" options={LOAN_TERM_OPTIONS} value={form.proposedLoanTerm} onChange={setField('proposedLoanTerm')} required error={errors.proposedLoanTerm} />
            <SelectField id="preferredBank" label="Preferred Bank" placeholder="Select Preferred Bank" options={BANK_OPTIONS} value={form.preferredBank} onChange={setField('preferredBank')} required error={errors.preferredBank} />
          </div>
          <TextAreaField id="detailedUseOfFunds" label="Detailed Use of Funds" placeholder="Describe exactly how the funds will be used..." value={form.detailedUseOfFunds} onChange={setField('detailedUseOfFunds')} required error={errors.detailedUseOfFunds} rows={4} />
        </div>
        <div className="rounded-xl border border-border-subtle bg-gray-50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Estimated Loan Summary</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Principal Amount:</span>
              <span className="text-sm font-medium text-text-primary">{fmtETB(principal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Interest Rate (Annual):</span>
              <span className="text-sm font-medium text-text-primary">18%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Processing Fee:</span>
              <span className="text-sm font-medium text-text-primary">2%</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-3">
              <span className="text-xs font-semibold text-text-primary">Estimated Total Repayment:</span>
              <span className="text-sm font-bold text-[#1a2332]">{fmtETB(totalRepayment)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 6 ───────────────────────────────────────────────────────────────────
function Step6({ form, setField, errors }) {
  const totalIncome = INCOME_FIELDS.reduce((s, f) => s + (parseFloat(form[f.key]) || 0), 0);
  const totalExpenditure = EXPENDITURE_FIELDS.reduce((s, f) => s + (parseFloat(form[f.key]) || 0), 0);
  const netCashFlow = totalIncome - totalExpenditure;
  function fmt(n) { return n.toFixed(2) + ' ETB'; }
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
          <h2 className="font-display text-base font-semibold text-text-primary">Household Income & Expenditure</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"><Cloud size={11} /> Offline Ready</span>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Annual Income Sources (ETB)</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {INCOME_FIELDS.map(({ key, label }) => (
                <NumberField key={key} id={key} label={label} value={form[key] || ''} onChange={setField(key)} required error={errors[key]} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
              <span className="text-xs font-medium text-text-primary">Total Estimated Income</span>
              <span className="text-sm font-semibold text-text-primary">{fmt(totalIncome)}</span>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Annual Household Expenditures (ETB)</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {EXPENDITURE_FIELDS.map(({ key, label, wide }) => (
                <div key={key} className={wide ? 'col-span-full' : ''}>
                  <NumberField id={key} label={label} value={form[key] || ''} onChange={setField(key)} required error={errors[key]} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
              <span className="text-xs font-medium text-text-primary">Total Estimated Expenditure</span>
              <span className="text-sm font-semibold text-text-primary">{fmt(totalExpenditure)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <div className="flex items-center gap-2">
          <Info size={15} className="shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Net Cash Flow Snapshot</p>
            <p className="text-xs text-blue-700">Total Annual Income: ETB {totalIncome.toLocaleString()} · Total Annual Expenses: ETB {totalExpenditure.toLocaleString()}</p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${netCashFlow >= 0 ? 'text-green-700' : 'text-red-600'}`}>Net Cash Flow: ETB {netCashFlow.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ─── Step 7 ───────────────────────────────────────────────────────────────────
function Step7({ form, setField, errors }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-base font-semibold text-text-primary">Collateral & Guarantor Information</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Collateral Information</h3>
          <div className="flex flex-col gap-4">
            <SelectField id="collateralType" label="Collateral Type" placeholder="Select Collateral Type" options={COLLATERAL_TYPE_OPTIONS} value={form.collateralType} onChange={setField('collateralType')} required error={errors.collateralType} />
            <TextField id="estimatedValue" label="Estimated Value (ETB)" placeholder="e.g. 50000" value={form.estimatedValue} onChange={setField('estimatedValue')} required error={errors.estimatedValue} />
            <TextAreaField id="descriptionCondition" label="Description / Condition" placeholder="Provide details about the collateral..." value={form.descriptionCondition} onChange={setField('descriptionCondition')} rows={6} />
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Personal Guarantor</h3>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField id="g1Name" label="Guarantor Name" placeholder="Full Name" value={form.guarantor1Name} onChange={setField('guarantor1Name')} required error={errors.guarantor1Name} />
              <SelectField id="g1Relationship" label="Relationship" placeholder="Select Relationship" options={RELATIONSHIP_OPTIONS} value={form.guarantor1Relationship} onChange={setField('guarantor1Relationship')} required error={errors.guarantor1Relationship} />
              <TextField id="g1Phone" label="Phone" placeholder="+251..." type="tel" value={form.guarantor1Phone} onChange={setField('guarantor1Phone')} required error={errors.guarantor1Phone} />
              <TextField id="g1FaydaId" label="Fayda ID" placeholder="Kebele ID or Fayda" value={form.guarantor1FaydaId} onChange={setField('guarantor1FaydaId')} required error={errors.guarantor1FaydaId} />
            </div>
            <div className="border-t border-border-subtle" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField id="g2Name" label="Guarantor Name" placeholder="Full Name" value={form.guarantor2Name} onChange={setField('guarantor2Name')} required error={errors.guarantor2Name} />
              <SelectField id="g2Relationship" label="Relationship" placeholder="Select Relationship" options={RELATIONSHIP_OPTIONS} value={form.guarantor2Relationship} onChange={setField('guarantor2Relationship')} required error={errors.guarantor2Relationship} />
              <TextField id="g2Phone" label="Phone" placeholder="+251..." type="tel" value={form.guarantor2Phone} onChange={setField('guarantor2Phone')} required error={errors.guarantor2Phone} />
              <TextField id="g2FaydaId" label="Fayda ID" placeholder="Kebele ID or Fayda" value={form.guarantor2FaydaId} onChange={setField('guarantor2FaydaId')} required error={errors.guarantor2FaydaId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 8 ───────────────────────────────────────────────────────────────────
const REQUIRED_DOCS = [
  { id: 'applicantId', label: 'Applicant ID (Fayda)', iconType: 'file-green', status: 'verified' },
  { id: 'landCert', label: 'Land Certificate', iconType: 'file-green', status: 'verified' },
  { id: 'farmerPhoto', label: 'Photo of Farmer with Farm', iconType: 'file-green', status: 'verified' },
  { id: 'guarantorSig', label: 'Guarantor Signature Form', iconType: 'file-green', status: 'verified' },
  { id: 'loanAgreement', label: 'Loan Agreement Signature', iconType: 'pending', status: 'pending' },
];

const OPTIONAL_DOCS = [
  { id: 'cooperative', label: 'Cooperative Membership Letter', iconType: 'users' },
  { id: 'collateralPhotos', label: 'Collateral Photos', iconType: 'image' },
];

function DocTileIcon({ type }) {
  if (type === 'file-green') return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50"><FileText size={18} className="text-green-600" /></div>;
  if (type === 'pending') return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50"><PenLine size={18} className="text-amber-600" /></div>;
  if (type === 'users') return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"><Users size={18} className="text-gray-500" /></div>;
  if (type === 'image') return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"><Image size={18} className="text-gray-500" /></div>;
  return null;
}

function Step8() {
  const verifiedCount = REQUIRED_DOCS.filter((d) => d.status === 'verified').length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Document upload</p>
          <p className="text-xs text-blue-700">Tap each tile to capture or upload. Files are auto-compressed and queued for sync if you're offline.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
          <h2 className="font-display text-base font-semibold text-text-primary">Document Verification Checklist</h2>
          <span className="text-sm font-medium text-text-muted">{verifiedCount} of {REQUIRED_DOCS.length} Uploaded</span>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Required Documents</h3>
            <div className="flex flex-col gap-3">
              {REQUIRED_DOCS.map((doc) => (
                <div key={doc.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${doc.status === 'pending' ? 'border-amber-200 bg-amber-50' : 'border-border-subtle bg-white'}`}>
                  <DocTileIcon type={doc.iconType} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{doc.label}</p>
                    {doc.status === 'verified'
                      ? <p className="flex items-center gap-1 text-xs text-green-600"><Check size={11} strokeWidth={3} /> Verified</p>
                      : <p className="text-xs text-amber-600">&#x26A0; Pending Upload</p>}
                  </div>
                  {doc.status === 'verified'
                    ? <button className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"><Eye size={12} /> View</button>
                    : <button className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"><Upload size={12} /> Upload</button>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Optional / Supporting Documents</h3>
            <div className="flex flex-col gap-3">
              {OPTIONAL_DOCS.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-white px-4 py-3">
                  <DocTileIcon type={doc.iconType} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{doc.label}</p>
                    <p className="text-xs text-text-muted">Optional</p>
                  </div>
                  <button className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"><Upload size={12} /> Upload</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 9 ───────────────────────────────────────────────────────────────────
function Step9({ form, setField, errors }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-base font-semibold text-text-primary">Final Review & Declaration</h2>
      </div>
      <div className="mb-6 rounded-xl border border-border-subtle bg-gray-50 px-4 py-4 sm:px-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">Application Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-text-muted">Applicant Name</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{form.fullName || 'Abebe Bikila'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Loan Type</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{form.loanType || 'Input Financing'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Requested Amount</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{form.requestedAmount ? `${form.requestedAmount} ETB` : '25,000 ETB'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Term</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{form.proposedLoanTerm ? `${form.proposedLoanTerm} Months` : '6 Months'}</p>
          </div>
        </div>
      </div>
      <p className="mb-6 text-sm leading-relaxed text-text-muted">
        I, the applicant, declare that all information provided in this application is true and complete to the best of my knowledge. I authorize OpenAgriNet and the partner financial institution to verify the information, share my data with the bank for credit assessment, and contact me regarding this application. I understand that providing false information may result in rejection of my application and legal action.
      </p>
      <div className="mb-6 flex flex-col gap-4">
        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${errors.declaration ? 'border-red-300 bg-red-50/40' : 'border-border-subtle bg-white hover:bg-gray-50'}`}>
          <input
            type="checkbox"
            checked={form.declaration || false}
            onChange={(e) => setField('declaration')(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border-subtle text-button focus:ring-button/20"
          />
          <div>
            <p className="text-sm font-semibold text-text-primary">Applicant Declaration</p>
            <p className="mt-0.5 text-xs text-text-muted">I confirm that all information provided in this application is true and accurate to the best of my knowledge. I understand that false information may result in the rejection of this loan application.</p>
          </div>
        </label>
        {errors.declaration && <p className="-mt-2 text-xs text-red-500">{errors.declaration}</p>}
        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${errors.agentVerified ? 'border-red-300 bg-red-50/40' : 'border-border-subtle bg-white hover:bg-gray-50'}`}>
          <input
            type="checkbox"
            checked={form.agentVerified || false}
            onChange={(e) => setField('agentVerified')(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border-subtle text-button focus:ring-button/20"
          />
          <div>
            <p className="text-sm font-semibold text-text-primary">Development Agent Verification</p>
            <p className="mt-0.5 text-xs text-text-muted">I, as the Development Agent, have reviewed this application and verified the identity and farm details of the applicant in person.</p>
          </div>
        </label>
        {errors.agentVerified && <p className="-mt-2 text-xs text-red-500">{errors.agentVerified}</p>}
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-8 py-6 sm:px-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <PenLine size={20} className="text-amber-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">Farmer Digital Signature</p>
            <p className="mt-0.5 text-xs text-amber-600">&#x26A0; Pending Upload</p>
          </div>
          <button className="rounded-lg border border-border-subtle bg-white px-4 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50">Upload</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function NewLoanApplication() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [autoSaved] = useState(true);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullName: '', fatherName: '', grandfatherName: '',
    dateOfBirth: '', gender: '', maritalStatus: '',
    mobilePhone: '', alternatePhone: '', educationLevel: '',
    region: 'Oromia', zone: 'East Shewa', woreda: 'Bishoftu', kebele: '',
    faydaId: '', otpCode: ['', '', '', '', '', ''],
    farmRegion: '', farmZone: '', farmWoreda: '', farmKebele: '',
    landOwnership: '', totalFarmSize: '', landCertificateNo: '', distanceToRoad: '',
    primaryCropType: '', secondaryCrop: '',
    farmingSeason: '', farmingSeasonYears: '', farmingSeasonYears2: '',
    expectedYield: '', purposeOfLoan: '',
    farmingPractices: {
      usesIrrigation: false, usesImprovedSeeds: true, usesFertilizers: true,
      memberOfCooperative: false, improvedSeeds: false, fertilizerUse: false,
      irrigation: false, cropRotation: false, pesticides: false, mechanization: false,
    },
    loanType: '', requestedAmount: '',
    repaymentFrequency: '', loanPurpose: '',
    proposedLoanTerm: '', preferredBank: '',
    detailedUseOfFunds: '',
    primaryCropSales: '', livestockSales: '',
    secondaryCropSalesIncome: '', farmingIncome: '',
    offFarmWage: '', otherIncome: '',
    foodLivingCosts: '', educationCost: '',
    healthCost: '', farmingInputsSelf: '',
    existingDebtRepayments: '', existingLoanRepayments: '',
    otherExpenditure: '',
    collateralType: '', estimatedValue: '', descriptionCondition: '',
    guarantor1Name: '', guarantor1Relationship: '', guarantor1Phone: '', guarantor1FaydaId: '',
    guarantor2Name: '', guarantor2Relationship: '', guarantor2Phone: '', guarantor2FaydaId: '',
    declaration: false,
    agentVerified: false,
  });

  function setField(key) {
    return (val) => setForm((prev) => ({ ...prev, [key]: val }));
  }

  function goNext() {
    const errs = validateStep(currentStep, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setErrors({});
    if (currentStep === 1) {
      navigate('/loanApplicationDashboard');
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleSubmit() {
    const errs = validateStep(9, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    alert('Application submitted successfully!');
  }

  const meta = STEP_META[currentStep - 1];
  const isLastStep = currentStep === STEPS.length;
  const errorCount = Object.keys(errors).length;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <button onClick={goBack} className="flex w-fit items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Page header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a7c59] text-sm font-semibold text-white">{currentStep}</span>
          <div>
            <h1 className="font-display text-lg font-semibold text-text-primary">{meta.title}</h1>
            <p className="text-xs text-text-muted">{meta.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button onClick={() => navigate('/loanApplicationDashboard')} className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50">Cancel</button>
          <button className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50">Save Draft</button>
        </div>
      </div>

      {/* Validation error banner */}
      {errorCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">
            Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before continuing.
          </p>
        </div>
      )}

      {/* Step progress */}
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:px-6 overflow-x-auto">
        <div className="flex items-start gap-0 min-w-[700px] lg:min-w-0">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.has(step.number);
            const isActive = step.number === currentStep;
            return (
              <div key={step.number} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  <div className={`h-px flex-1 ${step.number === 1 ? 'opacity-0' : isCompleted || isActive ? 'bg-[#4a7c59]' : 'bg-border-subtle'}`} />
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${isCompleted ? 'bg-[#4a7c59] text-white' : isActive ? 'bg-button text-white' : 'border border-border-subtle bg-white text-text-muted'}`}>
                    {isCompleted ? <Check size={13} strokeWidth={2.5} /> : step.number}
                  </span>
                  <div className={`h-px flex-1 ${step.number === STEPS.length ? 'opacity-0' : isCompleted ? 'bg-[#4a7c59]' : 'bg-border-subtle'}`} />
                </div>
                <p className={`text-center text-[10px] leading-snug ${isActive ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>
                  <span className="block font-medium">Step {step.number}</span>
                  {step.shortLabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      {currentStep === 1 && <Step1 form={form} setField={setField} errors={errors} />}
      {currentStep === 2 && <Step2 form={form} setField={setField} errors={errors} />}
      {currentStep === 3 && <Step3 form={form} setField={setField} errors={errors} />}
      {currentStep === 4 && <Step4 form={form} setField={setField} errors={errors} />}
      {currentStep === 5 && <Step5 form={form} setField={setField} errors={errors} />}
      {currentStep === 6 && <Step6 form={form} setField={setField} errors={errors} />}
      {currentStep === 7 && <Step7 form={form} setField={setField} errors={errors} />}
      {currentStep === 8 && <Step8 />}
      {currentStep === 9 && <Step9 form={form} setField={setField} errors={errors} />}

      {/* Bottom action bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50">Save Draft</button>
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <Check size={14} className="text-[#4a7c59]" strokeWidth={2.5} />
            {autoSaved ? 'Auto-saved' : 'Saving...'}
          </span>
          
        </div>
        <div className="flex items-center gap-2 justify-end">
          {currentStep > 1 && (
            <button onClick={goBack} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50">
              <ArrowLeft size={15} /> Previous
            </button>
          )}
          {isLastStep ? (
            <button onClick={handleSubmit} className="flex items-center gap-2 rounded-lg bg-[#4a7c59] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6347]">
              <Check size={15} strokeWidth={2.5} /> Submit Application
            </button>
          ) : (
            <button onClick={goNext} className="flex items-center gap-2 rounded-lg bg-button px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-button-hover">
              Next Step <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewLoanApplication;
