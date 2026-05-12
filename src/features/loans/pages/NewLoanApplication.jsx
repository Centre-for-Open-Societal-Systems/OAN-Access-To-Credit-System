import { useState, useRef, useEffect } from 'react';
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
  Clock,
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
  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div ref={containerRef} className="relative">
        {/* Trigger */}
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-base shadow-sm transition-all duration-150 focus:outline-none ${
            error
              ? 'border-red-400 bg-red-50/40'
              : isOpen
              ? 'border-[#4a7c59] bg-white ring-2 ring-[#4a7c59]/15'
              : 'border-border-subtle bg-white hover:border-[#4a7c59]/40'
          }`}
        >
          <span className={`truncate ${value ? 'text-text-primary' : 'text-text-muted'}`}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 transition-all duration-200 ${
              isOpen ? 'rotate-180 text-[#4a7c59]' : 'rotate-0 text-text-muted'
            }`}
          />
        </button>

        {/* Dropdown list */}
        <ul
          className={`absolute z-50 mt-1.5 w-full origin-top overflow-y-auto rounded-xl border border-border-subtle bg-white py-1 shadow-xl transition-all duration-150 ${
            isOpen
              ? 'pointer-events-auto scale-y-100 opacity-100'
              : 'pointer-events-none scale-y-95 opacity-0'
          }`}
          style={{ maxHeight: '216px' }}
        >
          {options.map((opt) => {
            const selected = value === opt;
            return (
              <li
                key={opt}
                onMouseDown={() => { onChange(opt); setIsOpen(false); }}
                className={`flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-base transition-colors ${
                  selected
                    ? 'bg-[#4a7c59]/8 font-medium text-[#4a7c59]'
                    : 'text-text-primary hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <span>{opt}</span>
                {selected && <Check size={13} strokeWidth={2.5} className="shrink-0 text-[#4a7c59]" />}
              </li>
            );
          })}
        </ul>
      </div>
      {error && <p className="mt-0.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function TextField({ id, label, placeholder, value, onChange, type = 'text', hint, required, readOnly, error, max, min }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-text-primary">
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
        className={`w-full rounded-lg border px-3 py-2.5 text-base shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-2 ${
          readOnly
            ? 'border-border-subtle bg-gray-50 text-text-muted cursor-default focus:border-border-subtle focus:ring-0'
            : error
            ? 'border-red-400 bg-red-50/40 text-text-primary focus:border-red-400 focus:ring-red-100'
            : 'border-border-subtle bg-white text-text-primary focus:border-button focus:ring-button/20'
        }`}
      />
      {hint && !error && <p className="text-sm text-text-muted">{hint}</p>}
      {error && <p className="mt-0.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function TextAreaField({ id, label, placeholder, value, onChange, required, rows = 4, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        rows={rows}
        className={`w-full resize-none rounded-lg border px-3 py-2.5 text-base text-text-primary shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
            : 'border-border-subtle bg-white focus:border-button focus:ring-button/20'
        }`}
      />
      {error && <p className="mt-0.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function NumberField({ id, label, value, onChange, required, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
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
      {error && <p className="mt-0.5 text-sm text-red-500">{error}</p>}
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
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">Applicant Personal Details</h2>
        <span className="text-xs text-text-muted">All fields required</span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="fullName" label="Full Name" placeholder="e.g. Tilahun" value={form.fullName} onChange={setField('fullName')} required error={errors.fullName} />
          <TextField id="fatherName" label="Father's Name" placeholder="e.g. Alemu" value={form.fatherName} onChange={setField('fatherName')} required error={errors.fatherName} />
          <TextField id="grandfatherName" label="Grandfather's Name" placeholder="e.g. Kebede" value={form.grandfatherName} onChange={setField('grandfatherName')} required error={errors.grandfatherName} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="dateOfBirth" label="Date of Birth" placeholder="mm/dd/yyyy" type="date" value={form.dateOfBirth} onChange={setField('dateOfBirth')} required error={errors.dateOfBirth} max={maxDob} min={minDob} />
          <SelectField id="gender" label="Gender" placeholder="Select Gender" options={GENDER_OPTIONS} value={form.gender} onChange={setField('gender')} required error={errors.gender} />
          <SelectField id="maritalStatus" label="Marital Status" placeholder="Select Marital Status" options={MARITAL_OPTIONS} value={form.maritalStatus} onChange={setField('maritalStatus')} required error={errors.maritalStatus} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="mobilePhone" label="Mobile Phone" placeholder="Enter Mobile No." type="tel" value={form.mobilePhone} onChange={setField('mobilePhone')} hint="Ethiopian mobile number (+251...)" required error={errors.mobilePhone} />
          <TextField id="alternatePhone" label="Alternate Phone" placeholder="Enter Mobile No." type="tel" value={form.alternatePhone} onChange={setField('alternatePhone')} hint="Ethiopian mobile number (+251...)" required error={errors.alternatePhone} />
          <SelectField id="educationLevel" label="Education Level" placeholder="Select Education" options={EDUCATION_OPTIONS} value={form.educationLevel} onChange={setField('educationLevel')} required error={errors.educationLevel} />
        </div>
        <div className="border-t border-border-subtle pt-5">
          <h3 className="mb-4 text-base font-semibold text-text-primary">Location Details</h3>
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

      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
          <h2 className="font-display text-lg font-semibold text-text-primary">KYC Identification (Fayda)</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Pending Verification</span>
        </div>
        <div className="flex flex-wrap justify-center gap-5 md:gap-8">
          {/* Left: Fayda ID entry */}
          <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-border-subtle bg-white px-4 py-6 sm:px-8 sm:py-8">
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
          <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-xl border border-border-subtle bg-white px-4 py-6 sm:px-8 sm:py-8">
            <div className="text-center">
              <h3 className="text-base font-semibold text-text-primary">Enter OTP Code</h3>
              <p className="mt-1 text-xs text-text-muted">Code sent to registered mobile ending in ****567</p>
            </div>
            <div className="flex justify-center gap-1.5 sm:gap-3">
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
                  className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg border border-border-subtle bg-white text-center text-base sm:text-xl font-semibold text-text-primary shadow-sm focus:border-button focus:outline-none focus:ring-2 focus:ring-button/20"
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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [coords, setCoords] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [zoom, setZoom] = useState(1);
  const [certDragging, setCertDragging] = useState(false);
  const certFileRef = useRef(null);

  function parseNominatimAddress(addr) {
    const rawState = addr.state || '';
    // Match Ethiopian region names — handles "Oromia Region", "Oromia National Regional State", etc.
    const matchedRegion = REGION_OPTIONS.find((r) =>
      rawState.toLowerCase().includes(r.toLowerCase())
    ) || '';
    // Strip common suffixes so the Zone field is clean (e.g. "East Shewa Zone" → "East Shewa")
    const rawZone = addr.county || addr.state_district || addr.region || '';
    const zone = rawZone.replace(/\s*(zone|district|woreda)$/i, '').trim();
    const woreda =
      addr.city_district ||
      addr.suburb ||
      addr.town ||
      addr.city ||
      addr.village ||
      addr.municipality ||
      '';
    const kebele =
      addr.neighbourhood || addr.quarter || addr.hamlet || addr.residential || '';
    return { matchedRegion, zone, woreda, kebele };
  }

  function handleCertFile(file) {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setGpsError('Land certificate must be a PDF, JPG, or PNG file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setGpsError('Land certificate file must be 5 MB or smaller.');
      return;
    }
    setField('landCertificateFile')(file);
  }

  async function handleGps() {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const { matchedRegion, zone, woreda, kebele } = parseNominatimAddress(addr);
          const displayName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setSearchValue(displayName);
          setField('farmRegion')(matchedRegion);
          setField('farmZone')(zone);
          setField('farmWoreda')(woreda);
          setField('farmKebele')(kebele);
        } catch {
          setGpsError('Coordinates captured but address lookup failed. Please fill the fields manually.');
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || 'Unable to retrieve location. Please allow location access.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleSearch() {
    if (!searchValue.trim()) return;
    setGpsLoading(true);
    setGpsError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchValue)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await res.json();
      if (!results || results.length === 0) {
        setGpsError('Address not found. Try a more specific search term.');
        setGpsLoading(false);
        return;
      }
      const { lat, lon } = results[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      setCoords({ lat: latitude, lng: longitude });
      const rev = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const revData = await rev.json();
      const addr = revData.address || {};
      const { matchedRegion, zone, woreda, kebele } = parseNominatimAddress(addr);
      setField('farmRegion')(matchedRegion);
      setField('farmZone')(zone);
      setField('farmWoreda')(woreda);
      setField('farmKebele')(kebele);
    } catch {
      setGpsError('Search failed. Please check your connection and try again.');
    }
    setGpsLoading(false);
  }

  return (
    <>
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Internet connection required</p>
          <p className="text-xs text-amber-700">GPS and address lookup require an active internet connection. You can also fill the fields manually.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
          <h2 className="font-display text-lg font-semibold text-text-primary">Farm Location & Land Details</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Pending Verification</span>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-text-primary">Current Geolocation</h3>
            {/* Search bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search address..."
                  className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-8 pr-3 text-sm text-text-primary shadow-sm focus:border-button focus:outline-none focus:ring-2 focus:ring-button/20"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={gpsLoading}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#1a2332] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#2a3342] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Search size={13} /> Search
              </button>
              <button
                onClick={handleGps}
                disabled={gpsLoading}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Crosshair size={13} className={gpsLoading ? 'text-gray-400 animate-spin' : 'text-blue-600'} />
                {gpsLoading ? 'Locating…' : 'GPS'}
              </button>
            </div>
            {gpsError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-xs text-red-700">{gpsError}</p>
              </div>
            )}
            {coords && !gpsError && (
              <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <MapPin size={12} className="shrink-0 text-green-600" />
                <p className="text-xs text-green-700 font-medium">
                  Location captured: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
              </div>
            )}
            {/* OSM-style street map */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200" style={{ height: '405px' }}>
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`${270 - 270 / zoom} ${142.5 - 142.5 / zoom} ${540 / zoom} ${285 / zoom}`}
                preserveAspectRatio="xMidYMid slice"
              >
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
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
                  className="flex h-6 w-6 items-center justify-center border-b border-gray-300 bg-white text-sm font-bold leading-none text-gray-700 hover:bg-gray-50"
                >+</button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.5, 0.5))}
                  className="flex h-6 w-6 items-center justify-center bg-white text-sm font-bold leading-none text-gray-600 hover:bg-gray-50"
                >−</button>
              </div>
              {/* Coordinates */}
              <div className="absolute bottom-1.5 left-2 flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-[10.5px] text-gray-600 shadow-sm">
                <MapPin size={9} className="text-blue-600" />
                {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '—, —'}
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
          <div className="flex flex-col gap-4 border-t border-border-subtle pt-5 lg:border-t-0 lg:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-text-primary">Farm Location & Land Details</h3>
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
              <input
                ref={certFileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleCertFile(e.target.files[0])}
              />
              {form.landCertificateFile ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-green-800">{form.landCertificateFile.name}</p>
                      <p className="text-[10px] text-green-600">{(form.landCertificateFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setField('landCertificateFile')(null); if (certFileRef.current) certFileRef.current.value = ''; }}
                    className="shrink-0 rounded px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50"
                  >Remove</button>
                </div>
              ) : (
                <div
                  onClick={() => certFileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setCertDragging(true); }}
                  onDragLeave={() => setCertDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setCertDragging(false); handleCertFile(e.dataTransfer.files[0]); }}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors ${
                    certDragging
                      ? 'border-button bg-button/5'
                      : 'border-border-subtle bg-gray-50 hover:border-button/50 hover:bg-gray-100'
                  }`}
                >
                  <Cloud size={22} className="text-text-muted" />
                  <p className="text-xs font-medium text-text-primary">Click or drag document to upload</p>
                  <p className="text-xs text-text-muted">PDF, JPG or PNG (Max 5MB)</p>
                  <p className="flex items-center gap-1 text-xs text-blue-600"><MapPin size={10} /> Use camera for offline capture</p>
                </div>
              )}
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
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">Agricultural Profile</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Pending Verification</span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h3 className="text-base font-semibold text-text-primary">Primary Crops</h3>
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
        <div className="border-t border-border-subtle pt-5 lg:border-t-0 lg:pt-0">
          <h3 className="mb-3 text-base font-semibold text-text-primary">Farming Practices (select all that apply)</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-1">
            {FARMING_PRACTICES.map(({ key, label }) => (
              <div key={key} className="flex cursor-pointer items-center gap-2.5" onClick={() => togglePractice(key)}>
                <AnimatedCheckbox checked={form.farmingPractices[key]} />
                <span className="text-sm text-text-primary select-none">{label}</span>
              </div>
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
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">Loan Request Details</h2>
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
          <h3 className="mb-4 text-base font-semibold text-text-primary">Estimated Loan Summary</h3>
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
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
          <h2 className="font-display text-lg font-semibold text-text-primary">Household Income & Expenditure</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"><Cloud size={11} /> Offline Ready</span>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Annual Income Sources (ETB)</h3>
            <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2 content-start">
              {INCOME_FIELDS.map(({ key, label }) => (
                <NumberField key={key} id={key} label={label} value={form[key] || ''} onChange={setField(key)} required error={errors[key]} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
              <span className="text-xs font-medium text-text-primary">Total Estimated Income</span>
              <span className="text-sm font-semibold text-text-primary">{fmt(totalIncome)}</span>
            </div>
          </div>
          <div className="flex flex-col border-t border-border-subtle pt-5 lg:border-t-0 lg:pt-0">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Annual Household Expenditures (ETB)</h3>
            <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2 content-start">
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
        <div className="flex items-start gap-2">
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
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">Collateral & Guarantor Information</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col">
          <h3 className="mb-4 text-base font-semibold text-text-primary">Collateral Information</h3>
          <div className="flex flex-col gap-4">
            <SelectField id="collateralType" label="Collateral Type" placeholder="Select Collateral Type" options={COLLATERAL_TYPE_OPTIONS} value={form.collateralType} onChange={setField('collateralType')} required error={errors.collateralType} />
            <TextField id="estimatedValue" label="Estimated Value (ETB)" placeholder="e.g. 50000" value={form.estimatedValue} onChange={setField('estimatedValue')} required error={errors.estimatedValue} />
            <div className="border-t border-border-subtle" />
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="descriptionCondition" className="text-sm font-medium text-text-primary">Description / Condition</label>
              <textarea
                id="descriptionCondition"
                placeholder="Provide details about the collateral..."
                value={form.descriptionCondition}
                onChange={(e) => setField('descriptionCondition')(e.target.value)}
                className="flex-1 min-h-[120px] w-full resize-none rounded-lg border border-border-subtle bg-white px-3 py-2.5 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus:border-button focus:outline-none focus:ring-2 focus:ring-button/20"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-border-subtle pt-5 lg:border-t-0 lg:pt-0">
          <h3 className="mb-4 text-base font-semibold text-text-primary">Personal Guarantor</h3>
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
const SYSTEM_VERIFIED_AT = new Date();
const REQUIRED_DOCS = [
  { id: 'applicantId',  label: 'Applicant ID (Fayda)',        iconType: 'file-green', initialStatus: 'verified', verifiedAt: SYSTEM_VERIFIED_AT, systemDocInfo: 'PDF · Fayda System' },
  { id: 'landCert',     label: 'Land Certificate',            iconType: 'file-green', initialStatus: 'verified', verifiedAt: SYSTEM_VERIFIED_AT, systemDocInfo: 'PDF · Fayda System' },
  { id: 'farmerPhoto',  label: 'Photo of Farmer with Farm',   iconType: 'file-green', initialStatus: 'verified', verifiedAt: SYSTEM_VERIFIED_AT, systemDocInfo: 'JPG · Fayda System' },
  { id: 'guarantorSig', label: 'Guarantor Signature Form',    iconType: 'file-green', initialStatus: 'verified', verifiedAt: SYSTEM_VERIFIED_AT, systemDocInfo: 'PDF · Fayda System' },
  { id: 'loanAgreement',label: 'Loan Agreement Signature',    iconType: 'pending',    initialStatus: 'pending'  },
];

const OPTIONAL_DOCS = [
  { id: 'cooperative',     label: 'Cooperative Membership Letter', iconType: 'users'  },
  { id: 'collateralPhotos',label: 'Collateral Photos',             iconType: 'image'  },
];

const ACCEPTED_DOC_TYPES = '.pdf,.jpg,.jpeg,.png';

function AnimatedCheckbox({ checked }) {
  return (
    <span className="pointer-events-none relative inline-flex shrink-0">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200"
        style={{
          borderColor: checked ? '#4a7c59' : '#d1d5db',
          backgroundColor: checked ? '#4a7c59' : 'white',
          boxShadow: checked ? '0 0 0 3px rgba(74,124,89,0.18)' : undefined,
        }}
      >
        <svg
          className={`transition-all duration-200 ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          width="11" height="9" viewBox="0 0 11 9" fill="none"
        >
          <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

function DocTileIcon({ type }) {
  if (type === 'file-green') return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50"><FileText size={18} className="text-green-600" /></div>;
  if (type === 'pending')    return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50"><PenLine size={18} className="text-amber-600" /></div>;
  if (type === 'users')      return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"><Users size={18} className="text-gray-500" /></div>;
  if (type === 'image')      return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"><Image size={18} className="text-gray-500" /></div>;
  return null;
}

// ─── Document View Modal ──────────────────────────────────────────────────────
function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function getFileFormat(file) {
  const ext = file.name.split('.').pop();
  return ext ? ext.toUpperCase() : 'FILE';
}

function formatDateTime(date) {
  if (!date) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
}

function DocViewModal({ doc, file, uploadedAt, duration, onDurationChange, onClose }) {
  const isImage   = file && file.type.startsWith('image/');
  const isPdf     = file && file.type === 'application/pdf';
  const objectUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-start gap-3">
            <DocTileIcon type={file ? 'file-green' : doc.iconType} />
            <div>
              <p className="text-sm font-semibold text-text-primary">{doc.label}</p>
              {file ? (
                <>
                  <p className="text-xs text-text-muted">{file.name} &middot; {(file.size / 1024).toFixed(1)} KB</p>
                  {uploadedAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-text-muted">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                      Uploaded on {formatDateTime(uploadedAt)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-green-600">Verified via Fayda system</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-gray-100"
          >✕</button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-auto">
          {/* Document preview */}
          <div className="flex flex-1 items-center justify-center p-4">
            {file ? (
              isImage ? (
                <img src={objectUrl} alt={doc.label} className="max-h-[40vh] max-w-full rounded-lg object-contain shadow" />
              ) : isPdf ? (
                <iframe src={objectUrl} title={doc.label} className="h-[40vh] w-full rounded-lg border border-border-subtle" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <FileText size={48} className="text-gray-300" />
                  <p className="text-sm text-text-muted">Preview not available for this file type.</p>
                  <a href={objectUrl} download={file.name} className="rounded-lg bg-button px-4 py-2 text-sm font-medium text-white hover:bg-button-hover">Download</a>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <Check size={40} className="text-green-500" />
                <p className="text-sm font-semibold text-green-700">Document Verified</p>
                <p className="text-xs text-text-muted">This document was verified via the Fayda system and is securely stored.</p>
              </div>
            )}
          </div>


        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border-subtle px-5 py-3">
          {uploadedAt ? (
            <p className="text-[11px] text-text-muted">Submitted: {formatDateTime(uploadedAt)}</p>
          ) : <span />}
          <button onClick={onClose} className="rounded-lg bg-button px-4 py-2 text-sm font-medium text-white hover:bg-button-hover">Save &amp; Close</button>
        </div>
      </div>
    </div>
  );
}

function Step8({ uploads, setUploads }) {
  // uploads: { [docId]: { file: File, uploadedAt: Date, duration: { issuedDate, expiryDate } } }
  const [viewDoc, setViewDoc]   = useState(null);
  const fileRefs                = useRef({});

  function handleFileSelect(docId, file) {
    if (!file) return;
    setUploads((prev) => ({
      ...prev,
      [docId]: { file, uploadedAt: new Date(), duration: prev[docId]?.duration || {} },
    }));
  }

  function updateDuration(docId, duration) {
    setUploads((prev) => prev[docId] ? { ...prev, [docId]: { ...prev[docId], duration } } : prev);
    setViewDoc((prev) => prev ? { ...prev, duration } : prev);
  }

  function removeUpload(docId) {
    setUploads((prev) => { const n = { ...prev }; delete n[docId]; return n; });
    if (fileRefs.current[docId]) fileRefs.current[docId].value = '';
  }

  function triggerPicker(docId) {
    fileRefs.current[docId]?.click();
  }

  function getStatus(doc) {
    if (uploads[doc.id]) return 'uploaded';
    return doc.initialStatus || 'pending';
  }

  const uploadedRequired = REQUIRED_DOCS.filter((d) => getStatus(d) !== 'pending').length;
  const uploadedOptional = OPTIONAL_DOCS.filter((d) => uploads[d.id]).length;
  const totalUploaded    = uploadedRequired + uploadedOptional;
  const totalDocs        = REQUIRED_DOCS.length + OPTIONAL_DOCS.length;

  return (
    <>
      {/* Hidden file inputs */}
      {[...REQUIRED_DOCS, ...OPTIONAL_DOCS].map((doc) => (
        <input
          key={doc.id}
          ref={(el) => (fileRefs.current[doc.id] = el)}
          type="file"
          accept={ACCEPTED_DOC_TYPES}
          className="hidden"
          onChange={(e) => handleFileSelect(doc.id, e.target.files[0])}
        />
      ))}

      {/* View modal */}
      {viewDoc && (
        <DocViewModal
          doc={viewDoc.doc}
          file={viewDoc.file}
          uploadedAt={viewDoc.uploadedAt}
          duration={viewDoc.duration}
          onDurationChange={(dur) => updateDuration(viewDoc.doc.id, dur)}
          onClose={() => setViewDoc(null)}
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Document upload</p>
            <p className="text-xs text-blue-700">Tap Upload to capture or attach a file. Click View to preview uploaded or verified documents.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
            <h2 className="font-display text-lg font-semibold text-text-primary">Document Verification Checklist</h2>
            <span className="text-sm font-medium text-text-muted">{totalUploaded} of {totalDocs} Uploaded</span>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Required */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Required Documents</h3>
              <div className="flex flex-col gap-3">
                {REQUIRED_DOCS.map((doc) => {
                  const status      = getStatus(doc);
                  const isDone      = status !== 'pending';
                  const entry       = uploads[doc.id];
                  const isVerified  = status === 'verified' && !entry; // pre-verified via Fayda
                  const isUploaded  = status === 'uploaded' && !!entry;
                  return (
                    <div
                      key={doc.id}
                      className={`flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:gap-3 ${
                        status === 'pending'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-border-subtle bg-white'
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <DocTileIcon type={isDone ? 'file-green' : doc.iconType} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary">{doc.label}</p>
                          {isDone ? (
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                <Check size={11} strokeWidth={3} />
                                {isVerified && !entry ? 'Verified' : 'Uploaded'}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-text-muted">
                                <Clock size={10} />
                                {entry ? formatDateTime(entry.uploadedAt) : formatDateTime(doc.verifiedAt)}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600">⚠ Pending Upload</p>
                          )}
                          {/* File / format info — shown for all completed rows */}
                          {entry ? (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
                              <FileText size={10} className="shrink-0" />
                              <span className="shrink-0 font-medium">{getFileFormat(entry.file)} &middot; {formatFileSize(entry.file.size)}</span>
                            </p>
                          ) : isDone && doc.systemDocInfo ? (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
                              <FileText size={10} className="shrink-0" />
                              <span>{doc.systemDocInfo}</span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                        {isDone && (
                          <>
                            <button
                              onClick={() => setViewDoc({ doc, file: entry?.file || null, uploadedAt: entry?.uploadedAt || null, duration: entry?.duration || {} })}
                              className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
                            ><Eye size={12} /> View</button>
                            <button
                              onClick={() => triggerPicker(doc.id)}
                              className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                            ><Upload size={12} /> Re-upload</button>
                          </>
                        )}
                        {!isDone && (
                          <button
                            onClick={() => triggerPicker(doc.id)}
                            className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
                          ><Upload size={12} /> Upload</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Optional */}
            <div className="border-t border-border-subtle pt-5 lg:border-t-0 lg:pt-0">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Optional / Supporting Documents</h3>
              <div className="flex flex-col gap-3">
                {OPTIONAL_DOCS.map((doc) => {
                  const entry    = uploads[doc.id];
                  const uploaded = !!entry;
                  return (
                    <div key={doc.id} className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-white px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <DocTileIcon type={uploaded ? 'file-green' : doc.iconType} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary">{doc.label}</p>
                          {uploaded ? (
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                <Check size={11} strokeWidth={3} /> Uploaded
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-text-muted">
                                <Clock size={10} /> {formatDateTime(entry.uploadedAt)}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted">Optional</p>
                          )}
                          {/* File / format info */}
                          {entry ? (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
                              <FileText size={10} className="shrink-0" />
                              <span className="shrink-0 font-medium">{getFileFormat(entry.file)} &middot; {formatFileSize(entry.file.size)}</span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {uploaded ? (
                        <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => setViewDoc({ doc, file: entry.file, uploadedAt: entry.uploadedAt, duration: entry.duration || {} })}
                            className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
                          ><Eye size={12} /> View</button>
                          <button
                            onClick={() => triggerPicker(doc.id)}
                            className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          ><Upload size={12} /> Re-upload</button>
                          <button
                            onClick={() => removeUpload(doc.id)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >Remove</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerPicker(doc.id)}
                          className="flex shrink-0 items-center gap-1 self-end rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50 sm:self-auto"
                        ><Upload size={12} /> Upload</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Step 9 ───────────────────────────────────────────────────────────────────
function Step9({ form, setField, errors, uploads = {} }) {
  const [sigFile, setSigFile]         = useState(null);
  const [sigUploadedAt, setSigUploadedAt] = useState(null);
  const [sigViewOpen, setSigViewOpen]  = useState(false);
  const sigInputRef                    = useRef(null);

  const sigDoc = { id: 'farmerSig', label: 'Farmer Digital Signature', iconType: 'pending' };

  function handleSigFile(file) {
    if (!file) return;
    setSigFile(file);
    setSigUploadedAt(new Date());
  }
  function getDocStatus(doc) {
    if (uploads[doc.id]) return 'uploaded';
    return doc.initialStatus || 'pending';
  }
  const allDocs = [
    ...REQUIRED_DOCS.map((d) => ({ ...d, section: 'Required' })),
    ...OPTIONAL_DOCS.map((d) => ({ ...d, section: 'Optional', initialStatus: 'optional' })),
  ];
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">Final Review & Declaration</h2>
      </div>
      <div className="mb-6 rounded-xl border border-border-subtle bg-gray-50 px-4 py-4 sm:px-5">
        <h3 className="mb-3 text-base font-semibold text-text-primary">Application Summary</h3>
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
        <div className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${errors.declaration ? 'border-red-300 bg-red-50/40' : 'border-border-subtle bg-white hover:bg-gray-50'}`}
          onClick={() => setField('declaration')(!(form.declaration || false))}>
          <AnimatedCheckbox checked={form.declaration || false} />
          <div>
            <p className="text-sm font-semibold text-text-primary">Applicant Declaration</p>
            <p className="mt-0.5 text-xs text-text-muted">I confirm that all information provided in this application is true and accurate to the best of my knowledge. I understand that false information may result in the rejection of this loan application.</p>
          </div>
        </div>
        {errors.declaration && <p className="-mt-2 text-xs text-red-500">{errors.declaration}</p>}
        <div className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${errors.agentVerified ? 'border-red-300 bg-red-50/40' : 'border-border-subtle bg-white hover:bg-gray-50'}`}
          onClick={() => setField('agentVerified')(!(form.agentVerified || false))}>
          <AnimatedCheckbox checked={form.agentVerified || false} />
          <div>
            <p className="text-sm font-semibold text-text-primary">Development Agent Verification</p>
            <p className="mt-0.5 text-xs text-text-muted">I, as the Development Agent, have reviewed this application and verified the identity and farm details of the applicant in person.</p>
          </div>
        </div>
        {errors.agentVerified && <p className="-mt-2 text-xs text-red-500">{errors.agentVerified}</p>}
      </div>
      <input
        ref={sigInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => handleSigFile(e.target.files[0])}
      />

      {/* Signature view modal */}
      {sigViewOpen && sigFile && (
        <DocViewModal
          doc={sigDoc}
          file={sigFile}
          uploadedAt={sigUploadedAt}
          duration={{}}
          onDurationChange={() => {}}
          onClose={() => setSigViewOpen(false)}
        />
      )}

      <div className="flex justify-center">
        {sigFile ? (
          <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-green-200 bg-white px-5 py-4 sm:max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <FileText size={20} className="text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">Farmer Digital Signature</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0">
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <Check size={11} strokeWidth={3} /> Uploaded
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-text-muted">
                    <Clock size={10} /> {formatDateTime(sigUploadedAt)}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
                  <FileText size={9} className="shrink-0" />
                  <span className="font-medium">{getFileFormat(sigFile)} &middot; {formatFileSize(sigFile.size)}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSigViewOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-subtle bg-white px-4 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
              ><Eye size={12} /> View</button>
              <button
                onClick={() => sigInputRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
              ><Upload size={12} /> Re-upload</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-5 sm:px-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <PenLine size={20} className="text-amber-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">Farmer Digital Signature</p>
              <p className="mt-0.5 text-xs text-amber-600">&#x26A0; Pending Upload</p>
            </div>
            <button
              onClick={() => sigInputRef.current?.click()}
              className="rounded-lg border border-border-subtle bg-white px-4 py-1.5 text-xs font-medium text-text-primary hover:bg-gray-50"
            >Upload</button>
          </div>
        )}
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
  const [step8Uploads, setStep8Uploads] = useState({});

  const [form, setForm] = useState({
    fullName: '', fatherName: '', grandfatherName: '',
    dateOfBirth: '', gender: '', maritalStatus: '',
    mobilePhone: '', alternatePhone: '', educationLevel: '',
    region: 'Oromia', zone: 'East Shewa', woreda: 'Bishoftu', kebele: '',
    faydaId: '', otpCode: ['', '', '', '', '', ''],
    farmRegion: '', farmZone: '', farmWoreda: '', farmKebele: '',
    landOwnership: '', totalFarmSize: '', landCertificateNo: '', distanceToRoad: '',
    landCertificateFile: null,
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
      navigate('/loans/applications');    } else {
      const prevStep = currentStep - 1;
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        // Clear the destination step and everything after it so the
        // stepper only shows green for steps that were fully passed.
        for (let i = prevStep; i <= STEPS.length; i++) {
          next.delete(i);
        }
        return next;
      });
      setCurrentStep(prevStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [submittedAt, setSubmittedAt]             = useState(null);

  function handleSubmit() {
    const errs = validateStep(9, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setShowSubmitConfirm(true);
  }

  function confirmSubmit() {
    const now = new Date();
    setShowSubmitConfirm(false);
    setSubmittedAt(now);

    // Persist submitted application to localStorage
    const appId = 'APP-' + String(Math.floor(Math.random() * 9000) + 1000);
    const MONTHS = ['January','February','March','April','May','June','July','August',
                    'September','October','November','December'];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} · ${timeStr}`;

    // Exclude non-serialisable fields (File objects, OTP digits)
    const { landCertificateFile, otpCode, ...serializableForm } = form;

    const newEntry = {
      id: appId,
      applicant: form.fullName || 'Unknown Applicant',
      type: form.loanType || 'Agricultural Loan',
      status: 'Pending Review',
      statusTone: 'info',
      updated: formattedDate,
      action: 'View',
      amount: form.requestedAmount || '',
      phone: form.mobilePhone || '',
      region: form.farmRegion || form.region || '',
      proposedLoanTerm: form.proposedLoanTerm || '',
      submittedAt: now.toISOString(),
      formData: serializableForm,
    };
    try {
      const existing = JSON.parse(localStorage.getItem('a2c_submitted_loans') || '[]');
      localStorage.setItem('a2c_submitted_loans', JSON.stringify([newEntry, ...existing]));
    } catch { /* ignore storage errors */ }

    setShowSubmitSuccess(true);
  }

  const meta = STEP_META[currentStep - 1];
  const isLastStep = currentStep === STEPS.length;
  const errorCount = Object.keys(errors).length;

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Submit confirmation modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check size={24} className="text-green-600" strokeWidth={2.5} />
            </div>
            <h2 className="mb-1 text-base font-semibold text-text-primary">Submit Application?</h2>
            <p className="mb-6 text-sm text-text-muted">Are you sure you want to submit this loan application? Once submitted, you will not be able to make changes.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-lg border border-border-subtle bg-white py-2 text-sm font-medium text-text-primary hover:bg-gray-50"
              >No, Cancel</button>
              <button
                onClick={confirmSubmit}
                className="flex-1 rounded-lg bg-[#4a7c59] py-2 text-sm font-medium text-white hover:bg-[#3a6347]"
              >Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit success modal */}
      {showSubmitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check size={32} className="text-green-600" strokeWidth={2.5} />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-text-primary">Application Submitted!</h2>
            <p className="mb-1 text-sm text-text-muted">Your loan application has been successfully submitted and is now under review.</p>
            <p className="mb-1 text-xs text-text-muted">
              Applicant: <span className="font-semibold text-text-primary">{form.fullName || 'Abebe Bikila'}</span>
            </p>
            <p className="mb-1 text-xs text-text-muted">
              Loan Type: <span className="font-semibold text-text-primary">{form.loanType || 'Input Financing'}</span> &middot; Amount: <span className="font-semibold text-text-primary">{form.requestedAmount ? `${Number(form.requestedAmount).toLocaleString()} ETB` : '25,000 ETB'}</span>
            </p>
            {submittedAt && (
              <p className="mb-4 flex items-center justify-center gap-1 text-xs text-text-muted">
                <Clock size={11} /> Submitted on {formatDateTime(submittedAt)}
              </p>
            )}
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 mb-5">
              <p className="text-xs text-green-700">You will be notified once your application has been reviewed by the assigned development agent and financial institution.</p>
            </div>
            <button
              onClick={() => { setShowSubmitSuccess(false); navigate('/loans/applications'); }}
              className="w-full rounded-lg bg-[#4a7c59] py-2.5 text-sm font-medium text-white hover:bg-[#3a6347]"
            >Done</button>
          </div>
        </div>
      )}
      <button onClick={goBack} className="flex w-fit items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Page header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a7c59] text-sm font-semibold text-white">{currentStep}</span>
          <div>
            <h1 className="font-display text-xl font-semibold text-text-primary">{meta.title}</h1>
            <p className="text-sm text-text-muted">{meta.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button onClick={() => navigate('/loans/applications')} className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50">Cancel</button>
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
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 overflow-x-auto">
        <div className="flex items-start gap-0 min-w-[480px] md:min-w-0">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.has(step.number);
            const isActive = step.number === currentStep;
            return (
              <div key={step.number} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  <div className={`h-px flex-1 ${step.number === 1 ? 'opacity-0' : isCompleted || isActive ? 'bg-[#4a7c59]' : 'bg-border-subtle'}`} />
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${isActive ? 'bg-button text-white' : isCompleted ? 'bg-[#4a7c59] text-white' : 'border border-border-subtle bg-white text-text-muted'}`}>
                    {isActive ? step.number : isCompleted ? <Check size={13} strokeWidth={2.5} /> : step.number}
                  </span>
                  <div className={`h-px flex-1 ${step.number === STEPS.length ? 'opacity-0' : isCompleted ? 'bg-[#4a7c59]' : 'bg-border-subtle'}`} />
                </div>
                <p className={`text-center text-[10px] leading-snug ${isActive ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>
                  <span className="block font-bold text-[10px]">Step {step.number}</span>
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
      {currentStep === 8 && <Step8 uploads={step8Uploads} setUploads={setStep8Uploads} />}
      {currentStep === 9 && <Step9 form={form} setField={setField} errors={errors} uploads={step8Uploads} />}

      {/* Bottom action bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-border-subtle bg-white px-4 py-2.5 sm:py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50">Save Draft</button>
          <span className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 sm:py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50 flex items-center gap-1.5 text-sm text-text-muted">
            <Check size={14} className="text-[#4a7c59]" strokeWidth={2.5} />
            {autoSaved ? 'Auto-saved' : 'Saving...'}
          </span>
          
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          {currentStep > 1 && (
            <button onClick={goBack} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-border-subtle bg-white px-4 py-2.5 sm:py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50">
              <ArrowLeft size={15} /> Previous
            </button>
          )}
          {isLastStep ? (
            <button onClick={handleSubmit} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-[#4a7c59] px-5 py-2.5 sm:py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6347]">
              <Check size={15} strokeWidth={2.5} /> Submit Application
            </button>
          ) : (
            <button onClick={goNext} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-button px-5 py-2.5 sm:py-2 text-sm font-medium text-white transition-colors hover:bg-button-hover">
              Next Step <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewLoanApplication;
