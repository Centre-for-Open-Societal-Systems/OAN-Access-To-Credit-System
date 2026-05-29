// @ts-nocheck
'use client';
import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Check, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight,
  Info, Upload, Eye, Fingerprint, FileText, Image, PenLine,
  Lock, Edit2, Send, X, Download, LayoutDashboard, Zap, Calendar, Clock, Landmark,
  User, Hash, Key, Smartphone, Banknote, Folder, Shield,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ReactNode } from 'react';

export interface FormState {
  [key: string]: any;
}

export interface StepProps {
  form: FormState;
  setField: (key: string) => (val: any) => void;
  errors?: Record<string, string>;
}

export interface UploadEntry {
  file: File;
  name: string;
  size: number;
  time: string;
  progress: number;
  url?: string;
}

export interface UploadsState {
  [key: string]: UploadEntry;
}

export interface Step5Props extends StepProps {
  uploads: UploadsState;
  setUploads: (val: any) => void;
}


const STEPS = [
  { number: 1, label: 'Consent & Supporting Documents' },
  { number: 2, label: 'Farmer Details' },
  { number: 3, label: 'Review Application' },
];

const STEP_META = [
  { title: 'Consent & Supporting Documents', subtitle: "Obtain farmer's consent and upload required documents" },
  { title: 'Farmer Details', subtitle: "Capture information about the requested loan and farming activities." },
  { title: 'Review Application', subtitle: "Please review all information before final submission. Resolve any warnings or missing info." },
];

const GENDER_OPTIONS = ['Male', 'Female'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const EDUCATION_OPTIONS = ['No Formal Education', 'Primary School', 'Secondary School', 'Vocational / TVET', 'Diploma', "Bachelor's Degree", 'Postgraduate'];
const LOAN_TYPE_OPTIONS = [
  { value: 'input', label: 'Input Financing', sub: 'Seeds, fertilizers, chemicals' },
  { value: 'machinery', label: 'Machinery/Equipment', sub: 'Tractors, harvesters, irrigation' },
  { value: 'conventional', label: 'Conventional', sub: 'Tractors, harvesters, irrigation' },
  { value: 'alhuda', label: 'Alhuda (Islamic Financing)', sub: 'Sharia-compliant agricultural credit' },
];
const PURPOSE_OPTIONS = ['Agro-processing (e.g., milling grain)', 'Crop Production', 'Livestock', 'Equipment Purchase', 'Land Development', 'Input Purchase'];
const DURATION_OPTIONS = ['6 Months', '12 Months (1 Year)', '18 Months', '24 Months (2 Years)', '36 Months (3 Years)'];
const CROP_OPTIONS = ['Barley', 'Wheat', 'Soybeans', 'Maize', 'Other Variety'];
const CROP_VARIETY_OPTIONS = ['Seed + S-Hela/Achen + Stellar Star', 'Hybrid Maize BH-546', 'Soybean Pawe-03', 'Barley HB-1307', 'Other Variety'];
const OTHER_FARMING_ACTIVITY_OPTIONS = ['Cattle, Poultry, Sheep/Goats, Other Income Sources', 'Cattle', 'Poultry', 'Sheep/Goats', 'Other Income Sources'];
const HARVEST_AGGREGATOR_OPTIONS = [
  { value: 'primaryCooperative', label: 'Primary Cooperative', sub: 'Member-based produce collection and marketing' },
  { value: 'nucleusFarmer', label: 'Nucleus Farmer', sub: 'Lead farmer coordinating outgrower harvests' },
];
const FERTILIZER_PRICE_OPTIONS = ['ETB 850 / Bag', 'ETB 900 / Bag', 'ETB 950 / Bag'];
const AGROCHEMICAL_OPTIONS = ['A', 'B', 'C', 'D'];
const CROP_PROTECTION_COST_OPTIONS = ['ETB 5,000', 'ETB 10,000', 'ETB 15,000'];
const DATA_FIELDS = ['Basic Profile (Required)', 'Phone Number', 'Farm Details & Location'];

const CONSENT_TYPE_OPTIONS = ['Specific (Single Farmer)', 'Group', 'Cooperative'];
const CONSENT_DURATION_OPTIONS = ['6 Months', '12 Months', '18 Months', '24 Months'];
const LANGUAGE_OPTIONS = ['Amharic', 'English', 'Oromiffa', 'Tigrinya', 'Somali', 'Other'];
const SOURCE_OF_INCOME_OPTIONS = ['Salary', 'Farming', 'Business', 'Pension', 'Other'];
const ID_TYPE_OPTIONS = ['National ID', 'Passport', 'Kebele ID', 'Driving License'];
const AGRONOMIC_FARMLAND_OPTIONS = ['Capacity for production', 'Good', 'Average', 'Poor'];
const LAND_OWNERSHIP_OPTIONS = ['Security of access', 'Owned', 'Leased', 'Shared'];
const SOIL_FERTILITY_OPTIONS = ['Future yield potential', 'High', 'Medium', 'Low'];
const MOISTURE_LEVEL_OPTIONS = ['Irrigation / drought risks', 'Well-irrigated', 'Rain-fed', 'Drought-prone'];

function formatDateTime(date: Date | string) {
  if (!date) return '';
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}
function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function AnimatedCheckbox({ checked, onChange }: { checked: boolean, onChange: () => void }) {
  return (
    <span className="pointer-events-none relative inline-flex shrink-0" onClick={onChange}>
      <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200"
        style={{ borderColor: checked ? '#16A34A' : '#d1d5db', backgroundColor: checked ? '#16A34A' : 'white', boxShadow: checked ? '0 0 0 3px rgba(74,124,89,0.18)' : undefined }}>
        <svg className={`transition-all duration-200 ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function DatePickerField({ id, label, value, onChange, required, error, disabled }: { id?: string, label?: string, value: string, onChange: (val: string) => void, required?: boolean, error?: string, disabled?: boolean }) {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('day');
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : maxDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : maxDate.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target)) { setIsOpen(false); setMode('day'); } }
    if (isOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  const displayValue = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, '0')} / ${MONTH_SHORT[selectedDate.getMonth()]} / ${selectedDate.getFullYear()}`
    : '';

  function isDisabled(y: number, m: number, d: number) {
    const dt = new Date(y, m, d);
    return dt > maxDate || dt < minDate;
  }

  function selectDay(d: number) {
    if (isDisabled(viewYear, viewMonth, d)) return;
    onChange(new Date(viewYear, viewMonth, d).toISOString().split('T')[0]);
    setIsOpen(false); setMode('day');
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Build 6×7 grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, type: 'other' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'cur' });
  while (cells.length < 42) cells.push({ day: cells.length - firstDay - daysInMonth + 1, type: 'other' });

  const yearRange = [];
  for (let y = maxDate.getFullYear(); y >= minDate.getFullYear(); y--) yearRange.push(y);

  return (
    <div className="relative flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <button id={id} type="button" onClick={() => { if (disabled) return; setIsOpen(o => !o); setMode('day'); }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-3 text-sm shadow-sm transition-all focus:outline-none
          ${disabled ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-default'
            : error ? 'border-red-400 bg-red-50/40'
              : isOpen ? 'border-[#4a7c59] bg-white ring-2 ring-[#4a7c59]/15'
                : 'border-gray-300 bg-white hover:border-[#4a7c59]/50'}`}>
        <span className={`flex items-center gap-2 ${disabled ? 'text-gray-500' : displayValue ? 'text-gray-900' : 'text-gray-400'}`}>
          <Calendar size={14} className="shrink-0 text-gray-400" />
          {displayValue || 'DD / MM / YYYY'}
        </span>
        <Calendar size={15} className="shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-72 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#16A34A' }}>
            <button type="button" onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => setMode(m => m === 'year' ? 'day' : 'year')}
              className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-white/80 transition-colors">
              {MONTH_FULL[viewMonth]} {viewYear}
              <ChevronDown size={13} className={`transition-transform ${mode === 'year' ? 'rotate-180' : ''}`} />
            </button>
            <button type="button" onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {mode === 'year' ? (
            <div className="h-56 overflow-y-auto px-2 py-2">
              <div className="grid grid-cols-3 gap-1">
                {yearRange.map(y => (
                  <button key={y} type="button" onClick={() => { setViewYear(y); setMode('day'); }}
                    className={`rounded-lg py-2 text-sm font-medium transition-colors
                      ${y === viewYear ? 'text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    style={y === viewYear ? { background: '#16A34A' } : {}}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-3 pb-3 pt-2">
              <div className="mb-1 grid grid-cols-7">
                {DAY_NAMES.map(d => (
                  <div key={d} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((cell, idx) => {
                  if (cell.type === 'other') {
                    return <div key={idx} className="flex h-8 w-8 items-center justify-center mx-auto text-xs text-gray-300">{cell.day}</div>;
                  }
                  const disabled = isDisabled(viewYear, viewMonth, cell.day);
                  const selected = selectedDate &&
                    selectedDate.getFullYear() === viewYear &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getDate() === cell.day;
                  const isTodayCell = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === cell.day;
                  return (
                    <button key={idx} type="button" onClick={() => selectDay(cell.day)} disabled={disabled}
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all
                        ${selected ? 'font-semibold text-white shadow'
                          : disabled ? 'cursor-not-allowed text-gray-300'
                            : isTodayCell ? 'font-semibold border-2 hover:bg-opacity-10'
                              : 'text-gray-700 hover:bg-gray-100'}`}
                      style={
                        selected ? { background: '#4a7c59' }
                          : isTodayCell ? { borderColor: '#4a7c59', color: '#4a7c59' }
                            : {}
                      }>
                      {cell.day}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                <button type="button" onClick={() => { onChange(''); setIsOpen(false); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Clear</button>
                <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                  <AlertTriangle size={9} /> Must be 18+
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({ id, label, placeholder, options, value, onChange, required, error, disabled }: { id?: string, label?: string, placeholder?: string, options: string[], value: string, onChange: (val: string) => void, required?: boolean, error?: string, disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }
    if (isOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
      <div ref={ref} className="relative">
        <button id={id} type="button" onClick={() => { if (disabled) return; setIsOpen(o => !o); }}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-3 text-sm shadow-sm transition-all focus:outline-none ${disabled ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-default' : error ? 'border-red-400 bg-red-50/40' : isOpen ? 'border-[#4a7c59] bg-white ring-2 ring-[#4a7c59]/15' : 'border-gray-300 bg-white hover:border-[#4a7c59]/50'}`}>
          <span className={disabled ? 'text-gray-500' : value ? 'text-gray-900' : 'text-gray-400'}>{value || placeholder}</span>
          <ChevronDown size={15} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#4a7c59]' : 'text-gray-400'}`} />
        </button>
        <ul className={`absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white py-1 shadow-xl transition-all ${isOpen ? 'pointer-events-auto scale-y-100 opacity-100' : 'pointer-events-none scale-y-95 opacity-0'}`}
          style={{ maxHeight: '200px', overflowY: 'auto', transformOrigin: 'top' }}>
          {options.map(opt => {
            const sel = value === opt;
            return <li key={opt} onMouseDown={() => { onChange(opt); setIsOpen(false); }}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${sel ? 'bg-[#4a7c59]/8 font-medium text-[#4a7c59]' : 'text-gray-800 hover:bg-gray-50'}`}>
              {opt}{sel && <Check size={13} strokeWidth={2.5} className="text-[#4a7c59]" />}
            </li>;
          })}
        </ul>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextField({ id, label, placeholder, value, onChange, type = 'text', hint, required, readOnly, error, icon, max, min }: { id?: string, label?: string, placeholder?: string, value: string, onChange?: (val: string) => void, type?: string, hint?: string, required?: boolean, readOnly?: boolean, error?: string, icon?: ReactNode, max?: string | number, min?: string | number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange ? e => onChange(e.target.value) : undefined} readOnly={readOnly} max={max} min={min}
          className={`w-full rounded-lg border px-3 py-3 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${icon ? 'pl-9' : ''} ${readOnly ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-default focus:outline-none' : error ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 focus:border-[#16A34A] focus:ring-[#16A34A]/20'}`} />
      </div>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextAreaField({ id, label, placeholder, value, onChange, required, rows = 4 }: { id?: string, label?: string, placeholder?: string, value: string, onChange?: (val: string) => void, required?: boolean, rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea id={id} placeholder={placeholder} value={value} onChange={onChange ? e => onChange(e.target.value) : undefined} rows={rows}
        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/20" />
    </div>
  );
}

function FormSectionCard({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
      <div className="mb-5 border-b border-gray-100 pb-4">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StepProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 overflow-x-auto">
      <div className="flex items-start gap-0 min-w-[720px] md:min-w-0">
        {STEPS.map(step => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;
          return (
            <div key={step.number} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <div className={`h-0.5 flex-1 transition-colors ${step.number === 1 ? 'opacity-0' : isDone || isActive ? 'bg-[#4a7c59]' : 'bg-gray-200'}`} />
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold border-2 transition-all ${isActive ? 'border-[#4B5563] bg-[#4B5563] text-white' : isDone ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
                  {isDone ? <Check size={13} strokeWidth={2.5} /> : step.number}
                </span>
                <div className={`h-0.5 flex-1 transition-colors ${step.number === STEPS.length ? 'opacity-0' : isDone ? 'bg-[#4a7c59]' : 'bg-gray-200'}`} />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-gray-500">Step {step.number}</p>
                <p className={`text-[12px] leading-tight ${isActive ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepFarmerDetails({ form, setField, errors }: StepProps) {
  const SectionHeader = ({ title }) => (
    <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <SectionHeader title="Basic Information" />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField id="fullName" label="First Name" placeholder="Amit" value={form.fullName} onChange={setField('fullName')} required error={errors.fullName} readOnly />
            <TextField id="lastName" label="Last Name" placeholder="Sharma" value={form.lastName} onChange={setField('lastName')} required readOnly />
            <TextField id="mobilePhone" label="Mobile Phone" placeholder="+251 9876543210" value={form.mobilePhone} onChange={setField('mobilePhone')} required type="tel" error={errors.mobilePhone} readOnly />
            <DatePickerField id="dateOfBirth" label="Date of Birth" value={form.dateOfBirth} onChange={setField('dateOfBirth')} required error={errors.dateOfBirth} disabled />
            <SelectField id="gender" label="Gender" placeholder="Select Gender" options={GENDER_OPTIONS} value={form.gender} onChange={setField('gender')} required error={errors.gender} disabled />
            <TextField id="woreda" label="Woreda" placeholder="Bishoftu" value={form.woreda} onChange={setField('woreda')} required readOnly />
            <TextField id="kebele" label="Kebele" placeholder="Bishoftu" value={form.kebele} onChange={setField('kebele')} required readOnly />
            <SelectField id="idType" label="ID Type" placeholder="Select ID Type" options={ID_TYPE_OPTIONS} value={form.idType} onChange={setField('idType')} required disabled />
            <TextField id="idNumber" label="ID Number" placeholder="29838928923" value={form.idNumber} onChange={setField('idNumber')} required readOnly />
            <SelectField id="language" label="Language" placeholder="Select Language" options={LANGUAGE_OPTIONS} value={form.language} onChange={setField('language')} required disabled />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <SectionHeader title="Land and Crop Information" />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField id="landSizeAcres" label="Land Size (Acres)" placeholder="12" type="number" value={form.landSizeAcres} onChange={setField('landSizeAcres')} required readOnly />
            <TextField id="farmId" label="Farm ID" placeholder="29838928923" value={form.farmId} onChange={setField('farmId')} required readOnly />
            <TextField id="farmPolygon" label="Farm Polygon" placeholder="Farm Polygon" value={form.farmPolygon} onChange={setField('farmPolygon')} required readOnly />
            <TextField id="landAcreage" label="Land Acreage" placeholder="Land Acreage" value={form.landAcreage} onChange={setField('landAcreage')} required readOnly />
            <TextField id="farmLandNumber" label="Farm Land Number" placeholder="29838928923" value={form.farmLandNumber} onChange={setField('farmLandNumber')} required readOnly />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <SectionHeader title="Socio-Economic Information" />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField id="maritalStatus" label="Marital Status" placeholder="Married" options={MARITAL_OPTIONS} value={form.maritalStatus} onChange={setField('maritalStatus')} required disabled />
            <TextField id="sizeOfFamily" label="Size of Family" placeholder="4" type="number" value={form.sizeOfFamily} onChange={setField('sizeOfFamily')} required readOnly />
            <TextField id="numberOfChildren" label="Number of Children" placeholder="3" type="number" value={form.numberOfChildren} onChange={setField('numberOfChildren')} required readOnly />
            <TextField id="noOfFemalesFamily" label="No. of Females (Family)" placeholder="3" type="number" value={form.noOfFemalesFamily} onChange={setField('noOfFemalesFamily')} required readOnly />
            <TextField id="noOfMalesFamily" label="No. of Males (Family)" placeholder="3" type="number" value={form.noOfMalesFamily} onChange={setField('noOfMalesFamily')} required readOnly />
            <TextField id="familyMemberOwnsLand" label="A Family Member Owns Land Independently" placeholder="3" type="number" value={form.familyMemberOwnsLand} onChange={setField('familyMemberOwnsLand')} required readOnly />
            <SelectField id="sourceOfIncome" label="Source of Income" placeholder="Salary" options={SOURCE_OF_INCOME_OPTIONS} value={form.sourceOfIncome} onChange={setField('sourceOfIncome')} required disabled />
            <SelectField id="educationLevel" label="Education Level" placeholder="Graduation" options={EDUCATION_OPTIONS} value={form.educationLevel} onChange={setField('educationLevel')} required disabled />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <SectionHeader title="Land, Crop and Livestock Information" />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField id="totalFarmlandLandowner" label="Total Farmland Size as Landowner" placeholder="3" type="number" value={form.totalFarmlandLandowner} onChange={setField('totalFarmlandLandowner')} required readOnly />
            <TextField id="totalFarmlandCropSharing" label="Total Farmland Size as Crop Sharing" placeholder="4" type="number" value={form.totalFarmlandCropSharing} onChange={setField('totalFarmlandCropSharing')} required readOnly />
            <TextField id="totalFarmlandRented" label="Total Farmland Size as Rented" placeholder="3" type="number" value={form.totalFarmlandRented} onChange={setField('totalFarmlandRented')} required readOnly />
            <TextField id="certificationId" label="Certification ID" placeholder="29838928923" value={form.certificationId} onChange={setField('certificationId')} required readOnly />
            <SelectField id="certificationPhoto" label="Certification Photo" placeholder="Yes" options={['Yes', 'No']} value={form.certificationPhoto} onChange={setField('certificationPhoto')} required disabled />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <SectionHeader title="Agronomic Data" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField id="farmlandSizeHectares" label="Farmland Size (Hectares)" placeholder="Capacity for production" options={AGRONOMIC_FARMLAND_OPTIONS} value={form.farmlandSizeHectares} onChange={setField('farmlandSizeHectares')} required disabled />
          <SelectField id="landOwnershipStatus" label="Land Ownership Status" placeholder="Security of access" options={LAND_OWNERSHIP_OPTIONS} value={form.landOwnershipStatus} onChange={setField('landOwnershipStatus')} required disabled />
          <SelectField id="soilFertility" label="Soil Fertility / Minerals" placeholder="Future yield potential" options={SOIL_FERTILITY_OPTIONS} value={form.soilFertility} onChange={setField('soilFertility')} required disabled />
          <SelectField id="moistureLevels" label="Moisture Levels" placeholder="Irrigation / drought risks" options={MOISTURE_LEVEL_OPTIONS} value={form.moistureLevels} onChange={setField('moistureLevels')} required disabled />
        </div>
      </div>
    </div>
  );
}

function StepConsentAndDocs({ form, setField, uploads, setUploads }: Step5Props) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [extraDocs, setExtraDocs] = useState<any[]>([]);
  const [viewingExtra, setViewingExtra] = useState<any>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);
  const consentInputRef = useRef<HTMLInputElement>(null);
  const [viewingConsent, setViewingConsent] = useState(false);

  const INLINE_DOCS = [
    { id: 'identityDoc', label: 'Identity Document', sub: 'National ID, Passport, or Kebele ID', required: true, showCamera: false },
    { id: 'landOwnerProof', label: 'Land Ownership Proof', sub: 'Title deed or Kebele certificate', required: true, showCamera: true },
  ];

  function handleUpload(docId: string, file: File) {
    setProgress(p => ({ ...p, [docId]: 0 }));
    setUploads((prev: any) => ({ ...prev, [docId]: { file, uploadedAt: new Date() } }));
    let v = 0;
    const iv = setInterval(() => {
      v += Math.random() * 30 + 10;
      if (v >= 100) { clearInterval(iv); setProgress(p => { const n = { ...p }; delete n[docId]; return n; }); }
      else setProgress(p => ({ ...p, [docId]: Math.min(v, 99) }));
    }, 300);
  }

  function removeUpload(docId: string) {
    setUploads((prev: any) => { const n = { ...prev }; delete n[docId]; return n; });
  }

  function handleExtraUpload(file: File) {
    setExtraDocs(prev => [...prev, { id: Date.now().toString() + Math.random(), file, uploadedAt: new Date() }]);
  }

  function removeExtraDoc(id: string) {
    setExtraDocs(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">
      {viewingConsent && uploads['consentForm'] && <ViewFileModal entry={uploads['consentForm']} label="Signed Consent Form" onClose={() => setViewingConsent(false)} />}
      {viewingExtra && <ViewFileModal entry={viewingExtra} label="Additional Document" onClose={() => setViewingExtra(null)} />}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <h2 className="mb-5 border-b border-gray-200 pb-4 text-base font-semibold text-gray-800">Consent Form</h2>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <TextField id="faydaIdReadOnly" label="Farmer ID / Fayda ID" value="************" readOnly />
              <div className="flex items-center gap-2">
                <Check size={16} className="text-[#16A34A]" strokeWidth={3} />
                <span className="text-xs font-medium text-gray-500">Consent provided on May 25, 2026</span>
              </div>
            </div>
            <div>
              <div className={`relative flex flex-col rounded-xl border p-4 transition-colors ${uploads['consentForm'] || progress['consentForm'] != null ? 'border-gray-200 bg-white shadow-sm' : 'border-dashed border-gray-300 bg-gray-50'}`}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Signed Consent Form</p>
                    <p className="text-xs text-gray-500">Physical copy signed by farmer</p>
                  </div>
                  {progress['consentForm'] != null && progress['consentForm'] < 100 ? (
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /> Uploading
                    </span>
                  ) : uploads['consentForm'] ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <Check size={12} strokeWidth={3} /> Uploaded
                    </span>
                  ) : null}
                </div>

                {(uploads['consentForm'] || progress['consentForm'] != null) ? (
                  <div className="mt-1">
                    {progress['consentForm'] != null && progress['consentForm'] < 100 ? (
                      <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500"><FileText size={18} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-800">{uploads['consentForm']?.file?.name || 'consent_signed_2024.pdf'}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs font-medium text-gray-500">{formatFileSize(uploads['consentForm']?.file?.size || 1200000)} / {formatFileSize(uploads['consentForm']?.file?.size || 1200000)}</p>
                              <p className="text-xs font-semibold text-gray-500">{Math.round(progress['consentForm'] ?? 100)}%</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full bg-[#16A34A] transition-all" style={{ width: `${progress['consentForm']}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                          <FileText size={13} className="shrink-0 text-gray-400" />
                          <span className="flex-1 truncate text-xs font-medium text-gray-700">{uploads['consentForm'].file.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-1">
                          <Clock size={11} className="shrink-0 text-gray-400" />
                          <span className="text-[11px] text-gray-500">Uploaded {formatUploadTime(uploads['consentForm'].uploadedAt)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setViewingConsent(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#4a7c59]/40 bg-[#4a7c59]/5 px-3 py-2 text-xs font-semibold text-[#4a7c59] hover:bg-[#4a7c59]/10 transition-colors">
                            <Eye size={12} /> View
                          </button>
                          <button onClick={() => removeUpload('consentForm')} className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-500 hover:bg-red-100 transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white">
                      <Upload size={16} className="text-gray-400" />
                    </div>
                    <button type="button" onClick={() => consentInputRef.current?.click()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
              <input ref={consentInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload('consentForm', e.target.files[0]); e.target.value = ''; }} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Data fields requested as part of Agriloan Consent <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {['Basic Profile (Required)', 'Phone Number', 'Farm Details & Location'].map(field => (
                <div key={field} className="flex items-center gap-2 rounded-lg border border-[#16A34A] bg-[#16A34A]/5 px-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                  <span className="text-sm font-medium text-gray-800">{field}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <h2 className="mb-5 flex items-center gap-1 text-base font-semibold text-gray-800 pb-4 border-b border-gray-200 "><span className="text-red-500">*</span> Required Documents</h2>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DocUploadCard doc={INLINE_DOCS[0]} entry={uploads[INLINE_DOCS[0].id]} uploadProgress={progress[INLINE_DOCS[0].id]} showCamera={INLINE_DOCS[0].showCamera} onUpload={f => handleUpload(INLINE_DOCS[0].id, f)} onRemove={() => removeUpload(INLINE_DOCS[0].id)} />
          <DocUploadCard doc={INLINE_DOCS[1]} entry={uploads[INLINE_DOCS[1].id]} uploadProgress={progress[INLINE_DOCS[1].id]} showCamera={INLINE_DOCS[1].showCamera} onUpload={f => handleUpload(INLINE_DOCS[1].id, f)} onRemove={() => removeUpload(INLINE_DOCS[1].id)} />
        </div>
        <h3 className="mb-4 text-sm font-semibold text-gray-800  pt-4 border-t border-gray-200">Additional Supporting Documents</h3>
        {extraDocs.length > 0 && (
          <div className="mb-4 flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            {extraDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white"><FileText size={14} className="text-gray-400" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-800">{doc.file.name}</p>
                </div>
                <div className="flex items-center gap-2">




                  <button onClick={() => setViewingExtra(doc)} className="flex items-center justify-center gap-1.5 rounded-lg border border-[#4a7c59]/40 bg-[#4a7c59]/5 px-3 py-2 text-xs font-semibold text-[#4a7c59] hover:bg-[#4a7c59]/10 transition-colors"><Eye size={12} />View</button>
                  <button onClick={() => removeExtraDoc(doc.id)} className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-400 hover:bg-red-100 transition-colors"><X size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div onClick={() => extraInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 cursor-pointer hover:border-[#4a7c59]/40 hover:bg-green-50/30 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"><Folder size={20} className="text-gray-500" /></div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-800">Drag and drop additional files here</p>
            <p className="text-xs text-gray-500 mt-1">Guarantor IDs, Business licenses, or other relevant docs.</p>
          </div>
          <span className="text-sm font-medium text-[#16A34A] bg-[#16A34A]/10 py-1.5 px-4 rounded-lg mt-2">+ Add Document</span>
        </div>
        <input ref={extraInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={e => { Array.from(e.target.files || []).forEach(f => handleExtraUpload(f)); e.target.value = ''; }} />
      </div>
    </div>
  );
}

const REQUIRED_DOCS = [
  { id: 'identityDoc', label: 'Identity Document', sub: 'National ID, Passport, or Kebele ID' },
  { id: 'consentForm', label: 'Signed Consent Form', sub: 'Physical copy signed by farmer' },
  { id: 'landOwnerProof', label: 'Land Ownership Proof', sub: 'Title deed or Kebele certificate', required: true },
  { id: 'marriageCert', label: 'Marriage Certificate', sub: 'Required if applicant is married' },
];

function formatUploadTime(date: Date) {
  if (!date) return '';
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ViewFileModal({ entry, label, onClose }: { entry: any, label: string, onClose: () => void }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!entry?.file) return;
    const objectUrl = URL.createObjectURL(entry.file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [entry]);

  if (!entry) return null;

  const isImage = entry.file.type.startsWith('image/');
  const isPdf = entry.file.type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="max-w-sm truncate text-xs text-gray-500">{entry.file.name} · {formatFileSize(entry.file.size)}</p>
          </div>
          <div className="flex items-center gap-3">
            {url && (
              <a href={url} download={entry.file.name}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download size={12} /> Download
              </a>
            )}
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-colors">
              <X size={15} className="text-gray-600" />
            </button>
          </div>
        </div>
        {/* Modal body */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-50 p-6 min-h-[200px]">
          {!url ? (
            <div className="flex flex-col items-center gap-2">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#4a7c59] border-t-transparent" />
              <p className="text-xs text-gray-500">Loading preview…</p>
            </div>
          ) : isImage ? (
            <img src={url} alt={entry.file.name} className="max-h-[65vh] max-w-full rounded-xl object-contain shadow" />
          ) : isPdf ? (
            <iframe src={url} title={entry.file.name} className="h-[65vh] w-full rounded-xl border border-gray-200" />
          ) : (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                <FileText size={32} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">{entry.file.name}</p>
              <p className="text-xs text-gray-500">Preview not available for this file type.</p>
              <a href={url} download={entry.file.name}
                className="flex items-center gap-1.5 rounded-lg bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a6347] transition-colors">
                <Download size={14} /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocUploadCard({ doc, entry, onUpload, onRemove, uploadProgress, showCamera = true }: { doc: any, entry: any, onUpload: (file: File) => void, onRemove: () => void, uploadProgress: number, showCamera?: boolean }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [viewing, setViewing] = useState(false);
  const isUploaded = !!entry;
  const isUploading = uploadProgress != null && uploadProgress < 100;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files[0]) { onUpload(e.target.files[0]); e.target.value = ''; }
  }

  return (
    <>
      {viewing && <ViewFileModal entry={entry} label={doc.label} onClose={() => setViewing(false)} />}
      <div className={`relative flex flex-col rounded-xl border p-4 transition-all ${isUploaded ? 'border-[#4a7c59]/30 bg-white shadow-sm' : 'border-dashed border-gray-300 bg-gray-50'
        }`}>
        {/* Card header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
            <p className="text-xs text-gray-500">{doc.sub}</p>
          </div>
          {isUploading ? (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-blue-500 border-t-transparent" /> Uploading
            </span>
          ) : isUploaded ? (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <Check size={10} strokeWidth={3} /> Uploaded
            </span>
          ) : null}
        </div>

        {/* Upload progress bar */}
        {isUploading && (
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-[#16A34A] transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        {/* Uploaded state */}
        {isUploaded && !isUploading && entry && (
          <div className="flex flex-col gap-2.5">
            {/* File name row */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <Image size={13} className="shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-xs font-medium text-gray-700">{entry.file.name}</span>
            </div>
            {/* Date-time row */}
            <div className="flex items-center gap-1.5 px-1">
              <Clock size={11} className="shrink-0 text-gray-400" />
              <span className="text-[11px] text-gray-500">Uploaded {formatUploadTime(entry.uploadedAt)}</span>
            </div>
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewing(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#4a7c59]/40 bg-[#4a7c59]/5 px-3 py-2 text-xs font-semibold text-[#4a7c59] hover:bg-[#4a7c59]/10 transition-colors">
                <Eye size={12} /> View
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <Upload size={12} /> Re-Upload
              </button>
              <button
                onClick={() => onRemove && onRemove()}
                className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-500 hover:bg-red-100 transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Empty / not-yet-uploaded state */}
        {!isUploaded && !isUploading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white">
              <Upload size={16} className="text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Browse Files
              </button>
              {showCamera && (
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  📷 Camera
                </button>
              )}
            </div>
          </div>
        )}

        {/* File inputs */}
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>
    </>
  );
}

const REVIEW_SECTIONS = [
  { key: 'consentOtp', icon: <User size={20} className="text-[#16A34A]" />, title: 'Consent & Supporting Documents', sub: "Obtain farmer's consent and upload required documents", status: 'complete', goStep: 1 },
  { key: 'farmerDetails', icon: <Folder size={20} className="text-[#16A34A]" />, title: 'Farmer Details', sub: 'Capture information about the requested loan and farming activities.', status: 'complete', goStep: 2 },
  { key: 'supportingDocs', icon: <Shield size={20} className="text-[#16A34A]" />, title: 'Supporting Documents', sub: "Obtain farmer's consent to access registry data via Fayda OTP", status: 'verified', goStep: 1 },
];

function ReviewSection({ section, expanded, onToggle, goToStep }: { section: any, expanded: boolean, onToggle: () => void, goToStep: (step: number) => void }) {
  const statusConfig: Record<string, any> = {
    complete: { label: 'Complete', bg: 'bg-green-100', text: 'text-green-700', icon: <Check size={12} strokeWidth={3} /> },
    verified: { label: 'Verified', bg: 'bg-green-100', text: 'text-green-700', icon: <Check size={12} strokeWidth={3} /> },
  };
  const cfg = statusConfig[section.status];
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-gray-100 transition-colors">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{section.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{section.sub}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            {cfg.icon} {cfg.label}
          </span>
          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-gray-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                {section.status === 'complete'
                  ? 'This section has been successfully completed. All required information is captured.'
                  : 'This information has been verified. You may edit the section details if necessary.'}
              </p>
              {section.status !== 'complete' && (
                <button onClick={() => goToStep(section.goStep)} className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#16A34A] hover:underline">
                  <Edit2 size={13} /> Edit Section
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepReviewApplication({ form, goToStep }: { form: FormState, goToStep: (step: number) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 shadow-sm sm:px-6">
        <h2 className="mb-6 text-base font-semibold text-gray-800">Review Application</h2>
        <div className="flex flex-col gap-4">
          {REVIEW_SECTIONS.map(section => (
            <ReviewSection key={section.key} section={section} expanded={!!expanded[section.key]} onToggle={() => setExpanded(p => ({ ...p, [section.key]: !p[section.key] }))} goToStep={goToStep} />
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <label className="flex cursor-pointer items-start gap-3" onClick={() => setAcknowledged(v => !v)}>
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${acknowledged ? 'border-[#16A34A] bg-[#16A34A]' : 'border-gray-300 bg-white'}`}>
              {acknowledged && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
            <span className={`text-sm transition-colors ${acknowledged ? 'text-gray-900' : 'text-gray-600'}`}>
              I acknowledge that the information provided is true and correct to the best of my knowledge.
            </span>
            <span className="ml-auto text-sm font-semibold text-[#16A34A] hover:underline whitespace-nowrap"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

function SummaryModal({ form, displayId, dateStr, timeStr, onClose }: { form: FormState, displayId: string, dateStr: string, timeStr: string, onClose: () => void }) {
  const F = ({ label, value }: { label: string, value: any }) => (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 break-words">{value || '—'}</p>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-8" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
          <p className="text-lg font-bold text-gray-800">Application Summary</p>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors">
            <X size={16} className="text-gray-600" />
          </button>
        </div>
        <div className="bg-[#16A34A] px-6 py-4">
          <p className="text-white font-bold text-lg">Application Summary</p>
          <p className="text-white/80 text-sm mt-0.5">ID: {displayId} · Submitted {dateStr} at {timeStr}</p>
        </div>
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A]">
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Submitted & Pending Review</p>
            <p className="text-xs text-[#16A34A]">Transmitted to Cooperative Bank of Oromia via SFTP</p>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[60vh] px-6 py-6 bg-white">
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">👤</span><h3 className="text-sm font-bold text-gray-900">Farmer Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              <F label="Full Name" value={form.fullName} />
              <F label="Father's Name" value={form.fatherName} />
              <F label="Farmer ID" value={form.farmerId} />
              <F label="Date of Birth" value={form.dateOfBirth} />
              <F label="Gender" value={form.gender} />
              <F label="Marital Status" value={form.maritalStatus} />
              <F label="Mobile Phone" value={form.mobilePhone} />
              <F label="Education Level" value={form.educationLevel} />
              <F label="National ID" value={form.idNumber} />
              <F label="Region" value={form.region} />
              <F label="Woreda" value={form.woreda} />
              <F label="Kebele" value={form.kebele} />
            </div>
          </div>
          <div className="mb-6 border-t border-gray-100 pt-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🔒</span><h3 className="text-sm font-bold text-gray-900">Loan Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              <F label="Loan Type" value={form.loanType} />
              <F label="Purpose" value={form.loanPurpose} />
              <F label="Requested Amount" value={form.requestedAmount ? `ETB ${Number(form.requestedAmount).toLocaleString()}` : ''} />
              <F label="Duration" value={form.loanDuration} />
              <F label="Primary Crops" value={(form.primaryCrops || []).join(', ')} />
              <F label="Crop Variety" value={form.cropVariety} />
              <F label="Land Size" value={form.landSize ? `${form.landSize} Ha` : ''} />
              <F label="Expected Yield" value={form.expectedYield ? `${form.expectedYield} Qt` : ''} />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🏦</span><h3 className="text-sm font-bold text-gray-900">Banking Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              <F label="Bank Account No." value={form.bankAccount} />
              <F label="IFSC / FSC Code" value={form.ifscCode} />
              <F label="Bank Name" value={form.bankName} />
              <F label="Account Holder" value={form.accountHolderName} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
          <p className="text-xs text-gray-400">Generated on {dateStr} · {timeStr}</p>
          <button onClick={onClose} className="rounded-xl bg-[#16A34A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#10883c] transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StepSubmitted({ form, submittedAt, appId }: { form: FormState, submittedAt: string, appId: string }) {
  const router = useRouter();
  const now = submittedAt ? new Date(submittedAt) : new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const displayId = appId || 'APP-2026-2676';
  const farmerName = form.fullName || 'Amit';
  const [showSummary, setShowSummary] = useState(false);

  return (
    <>
      {showSummary && <SummaryModal form={form} displayId={displayId} dateStr={dateStr} timeStr={timeStr} onClose={() => setShowSummary(false)} />}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="relative flex flex-col items-center gap-4 overflow-hidden bg-[#16A34A] px-6 py-12 text-center">
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-8 ring-[#10883c]">
              <Check size={36} className="text-white" strokeWidth={3} />
            </div>
            <div className="relative z-10 mt-2">
              <h2 className="text-2xl font-bold text-white">Application Submitted Successfully!</h2>
              <p className="mt-2 text-sm text-white/90">
                The loan application for <span className="font-bold text-white">{farmerName}</span> has been securely transmitted to Coop Bank for review.
              </p>
            </div>
            <span className="relative z-10 mt-2 flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">
              <Check size={12} strokeWidth={3} /> Verified & Submitted
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-3">
            {[
              { label: 'Application ID', value: displayId, icon: <FileText size={16} className="text-[#16A34A]" /> },
              { label: 'Submitted On', value: `${dateStr} ${timeStr}`, icon: <Calendar size={16} className="text-[#16A34A]" /> },
              { label: 'Transfer Method', value: 'SFTP Sync', icon: <Send size={16} className="text-[#16A34A]" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200/50">{icon}</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-6 mb-6 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xl text-gray-500"><User size={24} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900">{farmerName}</p>
              <p className="text-xs text-gray-500">{form.loanType} Loan · {form.loanDuration}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-[#16A34A]">
              <Check size={12} strokeWidth={3} /> Pending Review
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-gray-100 px-6 py-5 bg-gray-50/50">
            <button className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <Download size={16} /> Download PDF
            </button>
            <button onClick={() => setShowSummary(true)} className="flex items-center gap-2 rounded-xl border border-[#16A34A] bg-white px-5 py-3 text-sm font-semibold text-[#16A34A] shadow-sm hover:bg-[#16A34A]/5 transition-colors">
              View Summary
            </button>
            <button onClick={() => router.push('/loans/loan-application-dashboard')} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#10883c] transition-colors">
              <LayoutDashboard size={16} /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NewLoanApplication() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepUploads, setStepUploads] = useState({});
  const [submittedAt, setSubmittedAt] = useState<string>('');
  const [appId, setAppId] = useState<string>('');

  const [form, setForm] = useState<FormState>({
    fullName: 'Amit', lastName: 'Sharma', mobilePhone: '+251 9876543210', dateOfBirth: '1990-05-15', gender: 'Male',
    woreda: 'Bishoftu', kebele: 'Bishoftu', idType: 'National ID', idNumber: '29838928923', language: 'English',
    landSizeAcres: '12', farmId: '29838928923', farmPolygon: 'Farm Polygon', landAcreage: 'Land Acreage', farmLandNumber: '29838928923',
    maritalStatus: 'Married', sizeOfFamily: '4', numberOfChildren: '3', noOfFemalesFamily: '3', noOfMalesFamily: '3', familyMemberOwnsLand: '3', sourceOfIncome: 'Salary', educationLevel: 'Graduation',
    totalFarmlandLandowner: '3', totalFarmlandCropSharing: '4', totalFarmlandRented: '3', certificationId: '29838928923', certificationPhoto: 'Yes',
    farmlandSizeHectares: 'Capacity for production', landOwnershipStatus: 'Security of access', soilFertility: 'Future yield potential', moistureLevels: 'Irrigation / drought risks',
    loanType: 'input', loanDuration: '12 Months (1 Year)', loanPurpose: 'Agro-processing (e.g., milling grain)', primaryCrops: ['Teff'], cropVariety: 'Seed + S-Hela/Acherr + Stellar Star'
  });

  function setField(key: string) { return (val: any) => setForm(prev => ({ ...prev, [key]: val })); }

  function goNext() {
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setErrors({});
    if (currentStep === 1) { router.push('/loans/new-loan-application'); return; }
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit() {
    const now = new Date();
    setSubmittedAt(now.toISOString());
    setAppId('APP-2026-2676');
    setCurrentStep(STEPS.length + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isSubmitStep = currentStep === STEPS.length;
  const isLastStep = currentStep > STEPS.length;

  return (
    <div className="flex flex-col gap-5 pb-8 w-full px-[4px]">
      {!isLastStep && (
        <button onClick={goBack} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      )}

      {!isLastStep && (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${isLastStep ? 'bg-[#16A34A]' : 'bg-[#4B5563]'}`}>
              {currentStep}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{STEP_META[currentStep - 1]?.title}</h1>
                {currentStep === 3 && (
                  <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-bold text-[#16A34A]">
                    <Check size={10} strokeWidth={3} /> Verified via Fayda
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{STEP_META[currentStep - 1]?.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button onClick={() => router.push('/loans/new-loan-application')} className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
            <button className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Save Draft</button>
          </div>
        </div>
      )}

      {!isLastStep && <StepProgressBar currentStep={currentStep} />}

      {currentStep === 1 && <StepConsentAndDocs form={form} setField={setField} uploads={stepUploads} setUploads={setStepUploads} />}
      {currentStep === 2 && <StepFarmerDetails form={form} setField={setField} errors={errors} />}
      {currentStep === 3 && <StepReviewApplication form={form} goToStep={setCurrentStep} />}
      {currentStep === 4 && <StepSubmitted form={form} submittedAt={submittedAt} appId={appId} />}

      {!isLastStep && (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e3a8a] shadow-sm hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
            <span className="flex items-center gap-1.5 text-sm font-medium text-[#1e3a8a]">
              <Check size={16} className="text-[#1e3a8a]" strokeWidth={2.5} /> Auto-saved
            </span>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
            {currentStep > 2 && (
              <button onClick={goBack} className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                <ArrowLeft size={14} /> Previous Step
              </button>
            )}
            {isSubmitStep ? (
              <button onClick={handleSubmit} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#10883c] transition-colors">
                Submit Application <Send size={14} />
              </button>
            ) : (
              <button onClick={goNext} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#10883c] transition-colors">
                {currentStep === 1 ? 'Confirm & Next' : 'Next Step'} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
