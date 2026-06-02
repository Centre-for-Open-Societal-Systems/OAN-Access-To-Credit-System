// @ts-nocheck
'use client';
import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Check, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight,
  Info, Upload, Eye, Fingerprint, FileText, Image, PenLine,
  Lock, Edit2, Send, X, Download, LayoutDashboard, Zap, Calendar, Clock, Landmark,
  User, Hash, Key, Smartphone, Banknote,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ReactNode } from 'react';

import {
  STEP_META, GENDER_OPTIONS, MARITAL_OPTIONS, EDUCATION_OPTIONS, LOAN_TYPE_OPTIONS,
  PURPOSE_OPTIONS, DURATION_OPTIONS, CROP_OPTIONS, CROP_VARIETY_OPTIONS,
  OTHER_FARMING_ACTIVITY_OPTIONS, HARVEST_AGGREGATOR_OPTIONS, FERTILIZER_PRICE_OPTIONS,
  AGROCHEMICAL_OPTIONS, CROP_PROTECTION_COST_OPTIONS, DATA_FIELDS, CONSENT_TYPE_OPTIONS,
  CONSENT_DURATION_OPTIONS, LANGUAGE_OPTIONS, SOURCE_OF_INCOME_OPTIONS, ID_TYPE_OPTIONS,
  AGRONOMIC_FARMLAND_OPTIONS, LAND_OWNERSHIP_OPTIONS, SOIL_FERTILITY_OPTIONS, MOISTURE_LEVEL_OPTIONS
} from '@/features/loans/constants/loans.constants';

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
  { number: 1, label: 'Loan Details' },
  { number: 2, label: 'Bank Details' },
  { number: 3, label: 'Supporting Documents' },
  { number: 4, label: 'Consent & OTP Verification' },
  { number: 5, label: 'Farmer Details' },
  { number: 6, label: 'Review Application' },
];


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

const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

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
    ? `${String(selectedDate.getDate()).padStart(2,'0')} / ${MONTH_SHORT[selectedDate.getMonth()]} / ${selectedDate.getFullYear()}`
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
          {label}{required && <span className="ml-0.5 text-red-500">*</span>}
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
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>}
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
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>}
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
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>}
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
            <TextField id="fullName" label="Full Name" placeholder="Amit" value={form.fullName} onChange={setField('fullName')} required error={errors.fullName} readOnly />
            <TextField id="lastName" label="Last Name" placeholder="Sharma" value={form.lastName} onChange={setField('lastName')} required readOnly />
            <TextField id="mobilePhone" label="Mobile Phone" placeholder="+251 9876543210" value={form.mobilePhone} onChange={setField('mobilePhone')} required type="tel" error={errors.mobilePhone} readOnly />
            <DatePickerField id="dateOfBirth" label="Date of Birth" value={form.dateOfBirth} onChange={setField('dateOfBirth')} required error={errors.dateOfBirth} disabled />
            <SelectField id="gender" label="Gender" placeholder="Select Gender" options={GENDER_OPTIONS} value={form.gender} onChange={setField('gender')} required error={errors.gender} disabled />
            <TextField id="woreda" label="Woreda" placeholder="Bishoftu" value={form.woreda} onChange={setField('woreda')} required readOnly />
            <TextField id="kebele" label="Kebele" placeholder="Bishoftu" value={form.kebele} onChange={setField('kebele')} required readOnly />
            <SelectField id="idType" label="National ID / Fayda ID Number" placeholder="Select ID Type" options={ID_TYPE_OPTIONS} value={form.idType} onChange={setField('idType')} required disabled />
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

function Step1({ form, setField, errors }: StepProps) {
  function toggleCrop(crop: string) {
    const current = form.primaryCrops || [];
    setField('primaryCrops')(current.includes(crop) ? current.filter(c => c !== crop) : [...current, crop]);
  }

  const UnitInput = ({ id, label, placeholder, value, onChange, unit, required, error, type = 'number' }) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className={`flex overflow-hidden rounded-lg border shadow-sm focus-within:ring-2 ${error ? 'border-red-400 bg-red-50/40 focus-within:border-red-400 focus-within:ring-red-100' : 'border-gray-300 bg-white focus-within:border-[#16A34A] focus-within:ring-[#16A34A]/20'}`}>
        <input id={id} type={type} placeholder={placeholder} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange && onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none" />
        <span className="flex shrink-0 items-center border-l border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">{unit}</span>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  const CurrencyInput = ({ id, label, placeholder, value, onChange, required, error }) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className={`flex overflow-hidden rounded-lg border shadow-sm focus-within:ring-2 ${error ? 'border-red-400 bg-red-50/40 focus-within:border-red-400 focus-within:ring-red-100' : 'border-gray-300 bg-white focus-within:border-[#16A34A] focus-within:ring-[#16A34A]/20'}`}>
        <span className="flex shrink-0 items-center border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">ETB</span>
        <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange && onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none" />
        <span className="flex shrink-0 items-center border-l border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">.00</span>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  const DateInputField = ({ id, label, value, onChange, required, error }) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative">
        <input id={id} type="date" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange && onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border px-3 py-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 focus:border-[#16A34A] focus:ring-[#16A34A]/20'}`} />
        <Calendar size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <FormSectionCard title="Loan Requirements">
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Loan Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LOAN_TYPE_OPTIONS.map(opt => {
                const selected = form.loanType === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setField('loanType')(opt.value)}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${selected ? 'border-[#22C55E] bg-[#22C55E]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-[#22C55E]/40'}`}>
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-[#22C55E]' : 'border-gray-300'}`}>
                      {selected && <span className="h-2 w-2 rounded-full bg-[#22C55E]" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{opt.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.loanType && <p className="mt-1 text-xs text-red-500">{errors.loanType}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SelectField id="loanPurpose" label="Purpose of Loan" placeholder="Select Purpose of Loan" options={PURPOSE_OPTIONS} value={form.loanPurpose} onChange={setField('loanPurpose')} required error={errors.loanPurpose} />
            <CurrencyInput id="requestedAmount" label="Requested Loan Amount (ETB)" placeholder="0.00" value={form.requestedAmount} onChange={setField('requestedAmount')} required error={errors.requestedAmount} />
            <SelectField id="loanDuration" label="Loan Duration (Months)" placeholder="Select Loan Duration" options={DURATION_OPTIONS} value={form.loanDuration} onChange={setField('loanDuration')} required error={errors.loanDuration} />
            <TextField id="nearestBranch" label="Nearest Branch Responsible for Loan Administration" placeholder="Enter Nearest Branch Responsible for Loan Administration" value={form.nearestBranch} onChange={setField('nearestBranch')} required />
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard title="Crop & Land Information">
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Primary Crop/Seed Variety <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CROP_OPTIONS.map(crop => {
                const selected = (form.primaryCrops || []).includes(crop);
                return (
                  <button key={crop} type="button" onClick={() => toggleCrop(crop)} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${selected ? 'border-[#22C55E] bg-[#22C55E]/5 text-[#15803D]' : 'border-gray-300 bg-white text-gray-700 hover:border-[#22C55E]/40'}`}>
                    {crop}
                  </button>
                );
              })}
            </div>
            {errors.primaryCrops && <p className="mt-1 text-xs text-red-500">{errors.primaryCrops}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SelectField id="cropVariety" label="Crop Variety" placeholder="Select Crop Variety" options={CROP_VARIETY_OPTIONS} value={form.cropVariety} onChange={setField('cropVariety')} required />
            <TextField id="cropAddress" label="Address" placeholder="Enter Address" value={form.cropAddress} onChange={setField('cropAddress')} required error={errors.cropAddress} />
            <UnitInput id="quantityRequested" label="Quantity Requested (Kg)" placeholder="Enter Quantity Requested (Kg)" value={form.quantityRequested} onChange={setField('quantityRequested')} unit="kg" required />
            <TextField id="unitPrice" label="Unit Price" placeholder="Enter Unit Price" value={form.unitPrice} onChange={setField('unitPrice')} required type="number" />
            <TextField id="totalSeedCost" label="Total Seed Cost" placeholder="Enter Total Seed Cost" value={form.totalSeedCost} onChange={setField('totalSeedCost')} required type="number" />
            <UnitInput id="landSize" label="Land Size (Hectares)" placeholder="Enter Land Size" value={form.landSize} onChange={setField('landSize')} unit="ha" required />
            <UnitInput id="expectedYield" label="Expected Yield (Quintals/Hectare)" placeholder="Enter Expected Yield" value={form.expectedYield} onChange={setField('expectedYield')} unit="Qtl/ha" required />
            <DateInputField id="expectedHarvestDate" label="Expected Harvest Date" value={form.expectedHarvestDate} onChange={setField('expectedHarvestDate')} required />
            <UnitInput id="fertilizerUsed" label="Fertilizer Used" placeholder="Enter Fertilizer Used" value={form.fertilizerUsed} onChange={setField('fertilizerUsed')} unit="kg" required />
            <SelectField id="otherFarmingActivities" label="Other Farming Activities" placeholder="Select Other Farming Activities" options={OTHER_FARMING_ACTIVITY_OPTIONS} value={form.otherFarmingActivities} onChange={setField('otherFarmingActivities')} required />
            <UnitInput id="farmerGroup" label="Farmer Group" placeholder="Enter Farmer Group" value={form.farmerGroup} onChange={setField('farmerGroup')} unit="members" required />
            <UnitInput id="animalReared" label="Animal Reared" placeholder="Enter Animal Reared" value={form.animalReared} onChange={setField('animalReared')} unit="heads" required />
            <UnitInput id="farmEquipment" label="Farm Equipment" placeholder="Enter Farm Equipment" value={form.farmEquipment} onChange={setField('farmEquipment')} unit="units" required />
            <UnitInput id="farmSizeHectares" label="Farm Size (Hectares)" placeholder="Enter Farm Size (Hectares)" value={form.farmSizeHectares} onChange={setField('farmSizeHectares')} unit="ha" required />
            <TextField id="region" label="Region" placeholder="Enter Region" value={form.region} onChange={setField('region')} required />
            <TextField id="zone" label="Zone" placeholder="Enter Zone" value={form.zone} onChange={setField('zone')} required />
            <TextField id="woreda" label="Woreda / District" placeholder="Enter Woreda / District" value={form.woreda} onChange={setField('woreda')} required />
            <TextField id="kebele" label="Kebele" placeholder="Enter Kebele" value={form.kebele} onChange={setField('kebele')} required />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Harvest Aggregator Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {HARVEST_AGGREGATOR_OPTIONS.map(opt => {
                  const selected = form.harvestAggregatorType === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => setField('harvestAggregatorType')(opt.value)} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${selected ? 'border-[#22C55E] bg-[#22C55E]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-[#22C55E]/40'}`}>
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-[#22C55E]' : 'border-gray-300'}`}>
                        {selected && <span className="h-2 w-2 rounded-full bg-[#22C55E]" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{opt.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <TextField id="cooperativeName" label="Name of Cooperative / Nucleus Farmer" placeholder="Enter Name of Cooperative / Nucleus Farmer" value={form.cooperativeName} onChange={setField('cooperativeName')} required />
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard title="Fertilizer Requirement">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UnitInput id="dapQuantity" label="DAP Quantity (Kg)" placeholder="Enter DAP Quantity (Kg)" value={form.dapQuantity} onChange={setField('dapQuantity')} unit="kg" required />
          <UnitInput id="ureaQuantity" label="UREA Quantity (Kg)" placeholder="Enter UREA Quantity (Kg)" value={form.ureaQuantity} onChange={setField('ureaQuantity')} unit="kg" required />
          <SelectField id="fertilizerUnitPrice" label="Unit Price per Fertilizer Type" placeholder="Select Unit Price per Fertilizer Type" options={FERTILIZER_PRICE_OPTIONS} value={form.fertilizerUnitPrice} onChange={setField('fertilizerUnitPrice')} required />
          <TextField id="totalFertilizerCost" label="Total Fertilizer Cost" placeholder="Enter Total Fertilizer Cost" value={form.totalFertilizerCost} onChange={setField('totalFertilizerCost')} required type="number" />
        </div>
      </FormSectionCard>

      <FormSectionCard title="Crop Protection Requirement">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SelectField id="agrochemicalType" label="Type of Agrochemical Requested" placeholder="Select Agrochemical Type" options={AGROCHEMICAL_OPTIONS} value={form.agrochemicalType} onChange={setField('agrochemicalType')} required />
          <UnitInput id="cropProtectionQuantity" label="Quantity Requested" placeholder="Enter Quantity Requested" value={form.cropProtectionQuantity} onChange={setField('cropProtectionQuantity')} unit="kg" required />
          <TextField id="cropProtectionUnitPrice" label="Unit Price" placeholder="Enter Unit Price" value={form.cropProtectionUnitPrice} onChange={setField('cropProtectionUnitPrice')} required type="number" />
          <SelectField id="totalCropProtectionCost" label="Total Crop Protection Cost" placeholder="Select Total Crop Protection Cost" options={CROP_PROTECTION_COST_OPTIONS} value={form.totalCropProtectionCost} onChange={setField('totalCropProtectionCost')} required />
        </div>
      </FormSectionCard>

      <FormSectionCard title="Financing & Pricing Information">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TextField id="selectedInputSupplier" label="Selected Input Supplier" placeholder="Enter Selected Input Supplier" value={form.selectedInputSupplier} onChange={setField('selectedInputSupplier')} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Upfront Contribution <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <UnitInput id="maleFarmerContribution" placeholder="Enter Male Farmer" value={form.maleFarmerContribution} onChange={setField('maleFarmerContribution')} unit="% for Male Farmers" required />
              <UnitInput id="femaleFarmerContribution" placeholder="Enter Female Farmer" value={form.femaleFarmerContribution} onChange={setField('femaleFarmerContribution')} unit="% for Female Farmers" required />
            </div>
          </div>
          <UnitInput id="cropInsurancePremium" label="Crop Insurance premium (%)" placeholder="Enter Crop Insurance premium" value={form.cropInsurancePremium} onChange={setField('cropInsurancePremium')} unit="%" required />
        </div>
      </FormSectionCard>
    </div>
  );
}

function StepBankDetails({ form, setField, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <FormSectionCard title="Banking Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="bankAccountName" label="Bank Account Name" placeholder="Enter Bank Account Name" value={form.bankAccountName} onChange={setField('bankAccountName')} required error={errors.bankAccountName} icon={<Landmark size={14} />} hint="Must be a valid Coopbank account in the farmer's name." />
          <TextField id="bankAccount" label="Bank Account Number" placeholder="Enter Bank Account Number" value={form.bankAccount} onChange={setField('bankAccount')} required error={errors.bankAccount} icon={<Landmark size={14} />} hint="Must be a valid Coopbank account in the farmer's name." />
          <TextField id="bankName" label="Bank Name" placeholder="Enter Bank Name" value={form.bankName} onChange={setField('bankName')} required error={errors.bankName} icon={<Landmark size={14} />} />
          <TextField id="bankSwiftCode" label="Bank SWIFT/IFSC Code" placeholder="Enter Bank SWIFT/IFSC Code" value={form.bankSwiftCode} onChange={setField('bankSwiftCode')} required error={errors.bankSwiftCode} icon={<Landmark size={14} />} />
          <TextField id="mobileAccountName" label="Mobile Account Name" placeholder="Enter Mobile Account Name" value={form.mobileAccountName} onChange={setField('mobileAccountName')} required error={errors.mobileAccountName} icon={<Landmark size={14} />} />
          <TextField id="mobilePaymentsNumber" label="Mobile Payments Number" placeholder="Enter Mobile Payments Number" value={form.mobilePaymentsNumber} onChange={setField('mobilePaymentsNumber')} required error={errors.mobilePaymentsNumber} icon={<Landmark size={14} />} />
        </div>
      </FormSectionCard>

      <FormSectionCard title="Borrowing Amount">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="totalBorrowingAmount" label="Total Amount You Are Borrowing" placeholder="Enter Total Amount You Are Borrowing" value={form.totalBorrowingAmount} onChange={setField('totalBorrowingAmount')} required error={errors.totalBorrowingAmount} icon={<Landmark size={14} />} hint="Adjust the quantities below based on what you need. You can reduce or remove items you don't want." />
          <TextField id="taxId" label="Tax ID" placeholder="Enter Tax ID" value={form.taxId} onChange={setField('taxId')} icon={<Landmark size={14} />} hint="Above ETB 1,00,000/-" />
        </div>
      </FormSectionCard>
    </div>
  );
}

function Step3({ form, setField, errors }: StepProps) {
  const otpRefs            = useRef([]);
  const consentFileInputRef = useRef(null);
  const consentAttachRef    = useRef(null);
  const [otpSent,     setOtpSent]     = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError,    setOtpError]    = useState('');
  const [verifying,   setVerifying]   = useState(false);
  const [countdown,   setCountdown]   = useState(0);
  const timerRef = useRef(null);
  const [consentFileProgress, setConsentFileProgress] = useState(null);
  const [consentUploadedAt, setConsentUploadedAt]     = useState(null);
  const [viewingConsent, setViewingConsent]           = useState(false);

  function startCountdown(s: number = 102) {
    setCountdown(s);
    timerRef.current = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; }), 1000);
  }
  useEffect(() => () => clearInterval(timerRef.current), []);

  function handleSendOtp() {
    setOtpSent(true);
    setOtpVerified(false);
    setOtpError('');
    setField('otpCode')(['', '', '', '', '', '']);
    clearInterval(timerRef.current);
    startCountdown(102);
  }

  function handleOtpChange(i: number, v: string) {
    if (!/^\d?$/.test(v)) return;
    const n = [...(form.otpCode || ['','','','','',''])];
    n[i] = v;
    setField('otpCode')(n);
    setOtpError('');
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  }
  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !(form.otpCode || [])[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function handleVerify() {
    const code = (form.otpCode || []).join('');
    if (code.length < 6) { setOtpError('Please enter all 6 digits of the OTP.'); return; }
    setVerifying(true);
    setOtpError('');
    setTimeout(() => {
      setVerifying(false);
      setOtpVerified(true);
      clearInterval(timerRef.current);
      setCountdown(0);
    }, 1200);
  }

  function handleConsentFileUpload(file: File) {
    setField('consentFormFile')(file);
    setConsentUploadedAt(new Date());
    setConsentFileProgress(0);
    let v = 0;
    const iv = setInterval(() => {
      v += Math.random() * 30 + 10;
      if (v >= 100) { clearInterval(iv); setConsentFileProgress(null); }
      else setConsentFileProgress(Math.min(v, 99));
    }, 300);
  }

  const otpCode           = form.otpCode || ['','','','','',''];
  const fmtCountdown      = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const consentFile       = form.consentFormFile;
  const isConsentUploading = consentFileProgress != null;

  return (
    <div className="flex flex-col gap-5">
      {/* OTP Verification */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h2 className="text-base font-semibold text-gray-800">OTP Verification</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left panel */}
          <div className="flex flex-col gap-4">
            {/* Farmer search */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Farmer <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by Farmer ID or National ID"
                  value={form.farmerSearch || ''}
                  onChange={e => setField('farmerSearch')(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm shadow-sm focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
                />
                <button className="flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-3 text-sm font-medium text-white hover:bg-[#10883c] transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Farmer ID (Fayda) */}
            <TextField id="faydaId" label="Farmer ID (Fayda)" placeholder="e.g. 722334455" value={form.faydaId} onChange={setField('faydaId')} required error={errors.faydaId} icon={<Fingerprint size={14} />} />

            {/* Signed Consent Form upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Signed Consent Form</label>
              <div className={`relative rounded-xl border p-4 transition-all ${consentFile && !isConsentUploading ? 'border-[#4a7c59]/30 bg-white shadow-sm' : 'border-dashed border-gray-300 bg-gray-50'}`}>
                <div className="mb-2 flex flex-col items-center justify-between gap-2">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800">Signed Consent Form</p>
                    <p className="text-xs text-gray-500">Physical copy signed by farmer</p>
                  </div>
                  {isConsentUploading ? (
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border border-blue-500 border-t-transparent" /> Uploading
                    </span>
                  ) : consentFile ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      <Check size={10} strokeWidth={3} /> Uploaded
                    </span>
                  ) : null}
                </div>
                {isConsentUploading && (
                  <>
                    <p className="mb-1.5 text-xs text-gray-600">{consentFile?.name || 'consent_signed_2024.pdf'}</p>
                    <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500">
                      <span>{formatFileSize(consentFile?.size || 1258291)}</span>
                      <span>{Math.round(consentFileProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full bg-[#16A34A] transition-all" style={{ width: `${consentFileProgress}%` }} />
                    </div>
                  </>
                )}
                {consentFile && !isConsentUploading && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <FileText size={13} className="shrink-0 text-gray-400" />
                      <span className="flex-1 truncate text-xs font-medium text-gray-700">{consentFile.name}</span>
                      <span className="text-[11px] text-gray-400">{formatFileSize(consentFile.size)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingConsent(true)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#16A34A]/40 bg-[#4a7c59]/5 px-3 py-2 text-xs font-semibold text-[#16A34A] hover:bg-[#10883c]/10 transition-colors">
                        <Eye size={12} /> View
                      </button>
                      <button
                        onClick={() => { setField('consentFormFile')(null); setConsentUploadedAt(null); }}
                        className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-500 hover:bg-red-100 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                    {consentUploadedAt && (
                      <div className="flex items-center gap-1.5 px-1">
                        <Clock size={11} className="shrink-0 text-gray-400" />
                        <span className="text-[11px] text-gray-500">Uploaded {formatUploadTime(consentUploadedAt)}</span>
                      </div>
                    )}
                  </div>
                )}
                {!consentFile && !isConsentUploading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white">
                      <Upload size={16} className="text-gray-400" />
                    </div>
                    <button onClick={() => consentFileInputRef.current?.click()}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Browse Files
                    </button>
                  </div>
                )}
                <input ref={consentFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={e => { if (e.target.files[0]) { handleConsentFileUpload(e.target.files[0]); } e.target.value = ''; }} />
              </div>
            </div>
            {viewingConsent && consentFile && (
              <ViewFileModal
                entry={{ file: consentFile, uploadedAt: consentUploadedAt }}
                label="Signed Consent Form"
                onClose={() => setViewingConsent(false)}
              />
            )}

            {/* Data Fields to Request */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Data Fields to Request <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {DATA_FIELDS.map((field, idx) => {
                  const checked = (form.dataFields || DATA_FIELDS).includes(field);
                  return (
                    <div key={field}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 transition-all ${checked ? 'border-[#16A34A] bg-[#16A34A]/5' : 'border-gray-200 bg-white hover:border-[#4a7c59]/40'}`}
                      onClick={() => { if (idx === 0) return; const cur = form.dataFields || DATA_FIELDS; setField('dataFields')(cur.includes(field) ? cur.filter(f => f !== field) : [...cur, field]); }}>
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${checked ? 'border-[#16A34A] bg-[#16A34A]' : 'border-gray-300 bg-white'}`}>
                        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{field}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consent Authorization */}
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3">
              <Info size={14} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-blue-800">Consent Authorization</p>
                <p className="text-xs text-blue-700">By requesting OTP, you confirm the farmer is present and has verbally agreed to share their registry data with AgriBank for the purpose of this loan application.</p>
              </div>
            </div>

            {/* Send OTP Request */}
            <button onClick={handleSendOtp} disabled={otpVerified}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${otpVerified ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400' : 'bg-[#16A34A] text-white hover:bg-[#10883c]'}`}>
              <Send size={15} /> {otpSent && !otpVerified ? 'Resend OTP Request' : 'Send OTP Request'}
            </button>
          </div>

          {/* Right panel – OTP */}
          <div className={`flex flex-col items-center justify-center gap-5 rounded-xl border px-6 py-8 transition-all
            ${otpVerified ? 'border-green-200 bg-green-50/40' : otpSent ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
            {otpVerified ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check size={32} className="text-green-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-base font-bold text-green-800">Identity Verified Successfully!</p>
                  <p className="mt-1 text-sm text-gray-500">Fayda ID <strong>{form.faydaId}</strong> has been verified.<br />Registry data access has been granted.</p>
                </div>
                <div className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-left">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-700">Verification Details</p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Status</span><span className="flex items-center gap-1 font-semibold text-green-700"><Check size={11} strokeWidth={3} /> OTP Verified</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Phone</span><span className="font-medium">091****645</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Time</span><span className="font-medium">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  </div>
                </div>
              </div>
            ) : otpSent ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Smartphone size={22} className="text-[#16A34A]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">Fayda OTP Verification</p>
                  <p className="mt-1 text-xs text-gray-500">OTP sent to 091****645.<br />Ask the farmer to provide the 6-digit code.</p>
                </div>
                <div className="flex gap-2">
                  {otpCode.map((digit, i) => (
                    <input key={i} ref={el => (otpRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`h-12 w-12 rounded-xl border-2 bg-white text-center text-lg font-semibold text-gray-900 shadow-sm transition-all focus:outline-none focus:ring-2
                        ${otpError ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : digit ? 'border-[#4a7c59] focus:border-[#4a7c59] focus:ring-[#4a7c59]/20'
                        : 'border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20'}`} />
                  ))}
                </div>
                {otpError && <p className="flex items-center gap-1 text-xs text-red-500"><AlertTriangle size={12} /> {otpError}</p>}
                <button onClick={handleVerify} disabled={verifying}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${verifying ? 'cursor-not-allowed bg-[#4a7c59]/60 text-white' : 'bg-[#16A34A] text-white hover:bg-[#10883c]'}`}>
                  {verifying ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Verifying…</> : 'Verify Code'}
                </button>
                <p className="text-xs text-gray-500">
                  Didn't receive code?{' '}
                  {countdown > 0
                    ? <span className="font-medium text-gray-700">Resend in {fmtCountdown(countdown)}</span>
                    : <button className="font-semibold text-[#4a7c59] hover:underline" onClick={handleSendOtp}>Resend</button>}
                </p>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white">
                  <Smartphone size={28} className="text-gray-400" />
                </div>
                <p className="text-center text-sm text-gray-500">Enter the Farmer ID and click<br /><strong>Send OTP Request</strong> to begin verification.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Consent Request */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h2 className="text-base font-semibold text-gray-800">Consent Request</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="consentType"     label="Consent Type" placeholder="Specific (Single Farmer)" options={CONSENT_TYPE_OPTIONS}     value={form.consentType}     onChange={setField('consentType')}     required />
            <SelectField id="consentDuration" label="Duration"     placeholder="12 Months"                options={CONSENT_DURATION_OPTIONS} value={form.consentDuration} onChange={setField('consentDuration')} required />
          </div>
          <TextAreaField id="consentPurposeDetailed" label="Purpose of Loan (Detailed)" placeholder="Describe exactly how the funds will be used..." value={form.consentPurposeDetailed} onChange={setField('consentPurposeDetailed')} rows={4} />
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Upload content form (Attachment) <span className="text-red-500">*</span></label>
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 cursor-pointer hover:border-[#4a7c59]/40 hover:bg-green-50/20 transition-colors"
              onClick={() => consentAttachRef.current?.click()}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                <Upload size={20} className="text-gray-500" />
              </div>
              <p className="text-xs text-gray-500">content form</p>
              <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Browse Files
              </button>
            </div>
            <input ref={consentAttachRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={e => { if (e.target.files[0]) setField('consentAttachment')(e.target.files[0]); e.target.value = ''; }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const REGISTRY_FIELDS_INIT = [
  { key: 'legalName', label: 'Legal Name',             icon: '👤', appValue: 'Abebe Kebede',   registryValue: 'Abebe Kebede Tadesse',        locked: true,  status: 'match' },
  { key: 'dob',       label: 'Date of Birth',           icon: '🗓', appValue: '12/05/1985',     registryValue: '12/05/1985',                  locked: true,  status: 'match' },
  { key: 'gender',    label: 'Gender',                  icon: '⚧',  appValue: 'Male',           registryValue: 'Male',                        locked: true,  status: 'match' },
  { key: 'address',   label: 'Address (Region/Woreda)', icon: '📍', appValue: 'Oromia / Jimma', registryValue: 'Oromia / Jimma / Limmu Kosa', locked: false, status: 'warn'  },
  { key: 'landSize',  label: 'Land Size (Hectares)',    icon: '🌾', appValue: '2.5',            registryValue: '2.5',                         locked: false, status: 'match' },
  { key: 'faydaId',   label: 'Fayda ID',                icon: '🪪', appValue: 'Not entered',    registryValue: '722334455',                   locked: true,  status: 'auto'  },
];

function RegistryStatusBadge({ status }: { status: string }) {
  if (status === 'match') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700 whitespace-nowrap">
      <Check size={10} strokeWidth={3} /> Matched
    </span>
  );
  if (status === 'warn') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 whitespace-nowrap">
      <AlertTriangle size={10} /> Mismatch
    </span>
  );
  if (status === 'auto') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 whitespace-nowrap">
      <Zap size={10} /> Auto-filled
    </span>
  );
  return null;
}

function Step4() {
  const [fields, setFields] = useState(REGISTRY_FIELDS_INIT);
  const [editing, setEditing] = useState(null);   // key of field being edited
  const [editVal, setEditVal] = useState('');
  const [savedKey, setSavedKey] = useState(null); // key of recently saved field (for toast)
  const inputRef = useRef(null);

  const matchCount = fields.filter(f => f.status === 'match').length;
  const warnCount  = fields.filter(f => f.status === 'warn').length;
  const autoCount  = fields.filter(f => f.status === 'auto').length;

  function startEdit(field: string) {
    setEditing(field.key);
    setEditVal(field.registryValue);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function cancelEdit() { setEditing(null); setEditVal(''); }

  function saveEdit(key: string) {
    setFields(prev => prev.map(f => {
      if (f.key !== key) return f;
      const newVal = editVal.trim() || f.registryValue;
      const newStatus = newVal === f.appValue ? 'match' : f.status === 'auto' ? 'auto' : 'warn';
      return { ...f, registryValue: newVal, status: newStatus };
    }));
    setEditing(null);
    setEditVal('');
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2500);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: matchCount, label: 'Matched',    color: 'green', Icon: Check,         iconClass: 'text-green-600',  bg: 'bg-green-100',  border: 'border-green-200', textBig: 'text-green-700', textSm: 'text-green-600' },
          { count: warnCount,  label: 'Mismatches', color: 'amber', Icon: AlertTriangle,  iconClass: 'text-amber-600',  bg: 'bg-amber-100',  border: 'border-amber-200', textBig: 'text-amber-700', textSm: 'text-amber-600' },
          { count: autoCount,  label: 'Auto-filled',color: 'blue',  Icon: Zap,            iconClass: 'text-blue-600',   bg: 'bg-blue-100',   border: 'border-blue-200',  textBig: 'text-blue-700',  textSm: 'text-blue-600'  },
        ].map(({ count, label, bg, border, Icon, iconClass, textBig, textSm }) => (
          <div key={label} className={`flex items-center gap-3 rounded-2xl border ${border} bg-white px-4 py-3 shadow-sm`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={16} className={iconClass} strokeWidth={2.5} />
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none ${textBig}`}>{count}</p>
              <p className={`mt-0.5 text-xs font-medium ${textSm}`}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr_1fr_140px] border-b border-gray-100 bg-gray-50/80 px-5 py-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Field</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Application Data</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#4a7c59]">
            <FileText size={10} /> Fayda Registry
          </span>
          <span className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {fields.map((field) => {
            const { key, label, icon, appValue, registryValue, locked, status } = field;
            const isWarn    = status === 'warn';
            const isEditing = editing === key;
            const justSaved = savedKey === key;

            return (
              <div key={key}
                className={`grid grid-cols-[200px_1fr_1fr_140px] items-center gap-0 px-5 py-4 transition-all duration-200
                  ${isEditing ? 'bg-[#4a7c59]/5 ring-1 ring-inset ring-[#4a7c59]/20'
                  : isWarn    ? 'bg-amber-50/30 hover:bg-amber-50/60'
                  : 'hover:bg-gray-50/60'}`}>

                {/* Field label */}
                <div className="flex items-center gap-3 pr-4">
                  <span className="text-lg leading-none">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{label}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {locked
                        ? <><Lock size={9} className="text-gray-400" /><span className="text-[10px] text-gray-400">Registry-locked</span></>
                        : <><Edit2 size={9} className="text-[#4a7c59]" /><span className="text-[10px] text-[#4a7c59]">Editable</span></>
                      }
                    </div>
                  </div>
                </div>

                {/* Application value */}
                <div className="pr-4">
                  <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                    <span className="text-sm text-gray-600 truncate">{appValue}</span>
                  </div>
                </div>

                {/* Registry value — view or edit */}
                <div className="pr-4">
                  {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(key); if (e.key === 'Escape') cancelEdit(); }}
                        className="w-full rounded-lg border-2 border-[#4a7c59] bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
                      />
                      <div className="flex gap-1.5">
                        <button onClick={() => saveEdit(key)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#4a7c59] px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3a6347] transition-colors">
                          <Check size={10} strokeWidth={3} /> Save
                        </button>
                        <button onClick={cancelEdit}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                          <X size={10} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex items-center rounded-lg border px-3 py-3
                      ${justSaved ? 'border-[#4a7c59] bg-[#4a7c59]/5'
                      : isWarn    ? 'border-amber-300 bg-amber-50'
                      : 'border-green-200 bg-green-50/50'}`}>
                      <span className={`flex-1 text-sm font-medium truncate
                        ${justSaved ? 'text-[#4a7c59]'
                        : isWarn    ? 'text-amber-800'
                        : 'text-gray-800'}`}>
                        {registryValue}
                      </span>
                      {justSaved && <Check size={13} className="shrink-0 text-[#4a7c59]" strokeWidth={3} />}
                    </div>
                  )}
                </div>

                {/* Status + action */}
                <div className="flex flex-col items-center gap-1.5">
                  <RegistryStatusBadge status={status} />
                  {locked ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                      <Lock size={9} /> Locked
                    </span>
                  ) : isEditing ? (
                    <span className="text-[10px] font-semibold text-[#4a7c59]">Editing…</span>
                  ) : (
                    <button
                      onClick={() => startEdit(field)}
                      className="flex items-center gap-1 rounded-lg border border-[#4a7c59]/30 bg-[#4a7c59]/5 px-2.5 py-1 text-[11px] font-semibold text-[#4a7c59] hover:bg-[#4a7c59]/10 transition-colors">
                      <Edit2 size={10} /> Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy note */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <Info size={13} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800">Data Override Policy</p>
          <p className="mt-0.5 text-xs leading-relaxed text-blue-700">
            Fields marked as <strong>Locked</strong> are strictly synced with the Fayda registry and cannot be altered.
            For unlocked fields, any manual overrides will be flagged for secondary review during the final approval process.
            Edited values are highlighted in <strong className="text-[#4a7c59]">green</strong> after saving.
          </p>
        </div>
      </div>
    </div>
  );
}

const REQUIRED_DOCS = [
  { id: 'identityDoc',    label: 'Identity Document',    sub: 'National ID, Passport, or Kebele ID' },
  { id: 'consentForm',    label: 'Signed Consent Form',  sub: 'Physical copy signed by farmer' },
  { id: 'landOwnerProof', label: 'Land Ownership Proof', sub: 'Title deed or Kebele certificate', required: true },
  { id: 'marriageCert',   label: 'Marriage Certificate', sub: 'Required if applicant is married' },
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
  const isPdf   = entry.file.type === 'application/pdf';

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
  const fileRef   = useRef(null);
  const cameraRef = useRef(null);
  const [viewing, setViewing] = useState(false);
  const isUploaded  = !!entry;
  const isUploading = uploadProgress != null && uploadProgress < 100;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files[0]) { onUpload(e.target.files[0]); e.target.value = ''; }
  }

  return (
    <>
      {viewing && <ViewFileModal entry={entry} label={doc.label} onClose={() => setViewing(false)} />}
      <div className={`relative flex flex-col rounded-xl border p-4 transition-all ${
        isUploaded ? 'border-[#4a7c59]/30 bg-white shadow-sm' : 'border-dashed border-gray-300 bg-gray-50'
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
        <input ref={fileRef}   type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>
    </>
  );
}

function Step5({ uploads, setUploads, form, setField }: Step5Props) {
  const [progress, setProgress]         = useState({});
  const [extraDocs, setExtraDocs]       = useState([]);
  const [viewingExtra, setViewingExtra] = useState(null);
  const extraInputRef                   = useRef(null);

  const MARRIAGE_STATUSES = [
    { value: 'married',   label: 'Married' },
    { value: 'single',    label: 'Single/Unmarried' },
    { value: 'divorced',  label: 'Divorced' },
    { value: 'widow',     label: 'Widow/Widower' },
    { value: 'separated', label: 'Separated' },
  ];

  const INLINE_DOCS = [
    { id: 'marriageCert',   label: 'Marriage Certificate',  required: true,  showCamera: false },
    { id: 'identityDoc',    label: 'Identity Document',     required: true,  showCamera: false },
    { id: 'landOwnerProof', label: 'Land Ownership Proof',  required: true,  showCamera: true  },
  ];

  function handleUpload(docId: string, file: File) {
    setProgress(p => ({ ...p, [docId]: 0 }));
    setUploads(prev => ({ ...prev, [docId]: { file, uploadedAt: new Date() } }));
    let v = 0;
    const iv = setInterval(() => {
      v += Math.random() * 30 + 10;
      if (v >= 100) { clearInterval(iv); setProgress(p => { const n = { ...p }; delete n[docId]; return n; }); }
      else setProgress(p => ({ ...p, [docId]: Math.min(v, 99) }));
    }, 300);
  }

  function removeUpload(docId: string) {
    setUploads(prev => { const n = { ...prev }; delete n[docId]; return n; });
  }

  function handleExtraUpload(file: File) {
    setExtraDocs(prev => [...prev, { id: Date.now(), file, uploadedAt: new Date() }]);
  }

  function removeExtraDoc(id: string) {
    setExtraDocs(prev => prev.filter(d => d.id !== id));
  }

  const marriageStatus = form.marriageStatus || 'married';

  return (
    <div className="flex flex-col gap-5">
      {/* Marriage Status */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Marriage Status <span className="text-red-500">*</span></h2>
        <div className="flex flex-wrap gap-3">
          {MARRIAGE_STATUSES.map(opt => (
            <label key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all
                ${marriageStatus === opt.value
                  ? 'border-[#22C55E] bg-[#22C55E]/5 text-[#4a7c59]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#4a7c59]/40'}`}>
              <input type="radio" name="marriageStatus" value={opt.value} checked={marriageStatus === opt.value}
                onChange={() => setField('marriageStatus')(opt.value)} className="sr-only" />
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors
                ${marriageStatus === opt.value ? 'border-[#22C55E]' : 'border-gray-300'}`}>
                {marriageStatus === opt.value && (
                  <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                )}
              </span>
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Required Documents */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="mb-5 flex items-center gap-1 border-b border-gray-100 pb-4">
          <h2 className="text-base font-semibold text-gray-800">Required Documents</h2>
          <span className="ml-1 text-red-500 text-sm">*</span>
        </div>
        {/* Two-column grid: Marriage Certificate (if not single) + Identity Document */}
        <div className={`mb-4 grid grid-cols-1 gap-4 ${marriageStatus !== 'single' ? 'sm:grid-cols-2' : ''}`}>
          {marriageStatus !== 'single' && (
            <DocUploadCard doc={INLINE_DOCS[0]} entry={uploads[INLINE_DOCS[0].id]} uploadProgress={progress[INLINE_DOCS[0].id]}
              showCamera={INLINE_DOCS[0].showCamera}
              onUpload={f => handleUpload(INLINE_DOCS[0].id, f)} onRemove={() => removeUpload(INLINE_DOCS[0].id)} />
          )}
          <DocUploadCard doc={INLINE_DOCS[1]} entry={uploads[INLINE_DOCS[1].id]} uploadProgress={progress[INLINE_DOCS[1].id]}
            showCamera={INLINE_DOCS[1].showCamera}
            onUpload={f => handleUpload(INLINE_DOCS[1].id, f)} onRemove={() => removeUpload(INLINE_DOCS[1].id)} />
        </div>
        {/* Full-width: Land Ownership Proof */}
        <DocUploadCard doc={INLINE_DOCS[2]} entry={uploads[INLINE_DOCS[2].id]}
          uploadProgress={progress[INLINE_DOCS[2].id]}
          showCamera={INLINE_DOCS[2].showCamera}
          onUpload={f => handleUpload(INLINE_DOCS[2].id, f)}
          onRemove={() => removeUpload(INLINE_DOCS[2].id)} />
      </div>

      {/* Acknowledgment */}
      <div className={`rounded-2xl border bg-white px-4 py-4 shadow-sm sm:px-6 transition-colors ${form.acknowledgeDocDiscrepancy ? 'border-[#22C55E]/40 bg-green-50/40' : 'border-gray-200'}`}>
        <label className="flex cursor-pointer items-start gap-3" onClick={() => setField('acknowledgeDocDiscrepancy')(!form.acknowledgeDocDiscrepancy)}>
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors
              ${form.acknowledgeDocDiscrepancy ? 'border-[#22C55E] bg-[#22C55E]' : 'border-gray-300 bg-white'}`}>
            {form.acknowledgeDocDiscrepancy && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
          <span className={`text-sm transition-colors ${form.acknowledgeDocDiscrepancy ? 'font-sm text-gray-900' : 'text-gray-700'}`}>
            I acknowledge that all uploaded documents are authentic and accurate. Any discrepancy may result in the rejection of this application.
          </span>
        </label>
      </div>

      {/* Additional Supporting Documents */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        {viewingExtra && (
          <ViewFileModal entry={viewingExtra} label={viewingExtra.file.name} onClose={() => setViewingExtra(null)} />
        )}
        <h2 className="mb-4 text-base font-semibold text-gray-800">Additional Supporting Documents</h2>

        {extraDocs.length > 0 && (
          <div className="mb-4 flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            {extraDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white">
                  <FileText size={14} className="text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-800">{doc.file.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-gray-400" />
                    <span className="text-[11px] text-gray-400">{formatUploadTime(doc.uploadedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setViewingExtra(doc)}
                    className="flex items-center gap-1 rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/5 px-2.5 py-1.5 text-[11px] font-semibold text-[#16A34A] hover:bg-[#16A34A]/10 transition-colors">
                    <Eye size={11} /> View
                  </button>
                  <button onClick={() => removeExtraDoc(doc.id)}
                    className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-400 hover:bg-red-100 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div onClick={() => extraInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 cursor-pointer hover:border-[#4a7c59]/40 hover:bg-green-50/30 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Upload size={20} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Drag and drop additional files here</p>
            <p className="text-xs text-gray-500">Guarantor IDs, Business licenses, or other relevant docs.</p>
          </div>
          <span className="text-sm font-medium text-[#22C55E] bg-[#e6faee] py-1 px-3 rounded-md">+ Add Document</span>
        </div>
        <input ref={extraInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden"
          onChange={e => { Array.from(e.target.files || []).forEach(f => handleExtraUpload(f)); e.target.value = ''; }} />
      </div>
    </div>
  );
}

const REVIEW_SECTIONS = [
  { key: 'loanDetails',      icon: '🌾', title: 'Loan Details',               sub: 'Capture the requested loan, crop, and pricing details.',                status: 'complete', goStep: 1 },
  { key: 'bankDetails',      icon: '🏦', title: 'Bank Details',               sub: 'Provide payout accounts and borrowing information.',                    status: 'complete', goStep: 2 },
  { key: 'supportingDocs',   icon: '🛡', title: 'Supporting Documents',       sub: 'Upload the documents required for review.',                            status: 'complete', goStep: 3 },
  { key: 'consentOtp',       icon: '🔐', title: 'Consent & OTP Verification', sub: 'Verify farmer identity and capture consent for registry data access.', status: 'verified', goStep: 4 },
  { key: 'farmerDetails',    icon: '🧑‍🌾', title: 'Farmer Details',            sub: 'Confirm the farmer profile and agronomic details.',                    status: 'complete', goStep: 5 },
];

const REQUIRED_DOC_LABELS = {
  identityDoc:    'Identity Document',
  consentForm:    'Signed Consent Form',
  landOwnerProof: 'Land Ownership Proof',
  marriageCert:   'Marriage Certificate',
};

function ReviewSection({ section, expanded, onToggle, goToStep }: { section: any, expanded: boolean, onToggle: () => void, goToStep: (step: number) => void }) {
  const statusConfig = {
    complete: { label: 'Complete', bg: 'bg-green-100', text: 'text-green-700' },
    verified: { label: 'Verified', bg: 'bg-blue-100',  text: 'text-blue-700'  },
    mismatch: { label: 'Mismatch', bg: 'bg-amber-100', text: 'text-amber-700' },
    pending:  { label: 'Pending',  bg: 'bg-gray-100',  text: 'text-gray-600'  },
  };
  const cfg = statusConfig[section.status] || statusConfig.pending;
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button type="button" onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="text-xl leading-none">{section.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{section.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{section.sub}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
          <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500">This section has been filled. Review the details before submitting.</p>
            <button onClick={() => goToStep(section.goStep)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#4a7c59]/30 bg-[#4a7c59]/5 px-3 py-1.5 text-xs font-semibold text-[#4a7c59] hover:bg-[#4a7c59]/10 transition-colors">
              <Edit2 size={11} /> Edit Section
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step6({ form, uploads, goToStep }: { form: FormState, uploads: UploadsState, goToStep: (step: number) => void }) {
  const [expanded, setExpanded]       = useState({});
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h2 className="text-base font-semibold text-gray-800">Review Application</h2>
          <p className="text-xs text-gray-500 mt-1">Please review each section before submitting your application.</p>
        </div>
        <div className="flex flex-col gap-3">
          {REVIEW_SECTIONS.map(section => (
            <ReviewSection
              key={section.key}
              section={section}
              expanded={!!expanded[section.key]}
              onToggle={() => setExpanded(p => ({ ...p, [section.key]: !p[section.key] }))}
              goToStep={goToStep}
            />
          ))}
        </div>
      </div>

      {/* Acknowledgment */}
      <div className={`rounded-2xl border bg-white px-4 py-4 shadow-sm sm:px-6 transition-colors ${acknowledged ? 'border-[#4a7c59]/40 bg-green-50/40' : 'border-gray-200'}`}>
        <label className="flex cursor-pointer items-start gap-3" onClick={() => setAcknowledged(v => !v)}>
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors
              ${acknowledged ? 'border-[#4a7c59] bg-[#4a7c59]' : 'border-gray-300 bg-white'}`}>
            {acknowledged && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
          <span className={`text-sm transition-colors ${acknowledged ? 'font-sm text-gray-900' : 'text-gray-700'}`}>
            I confirm that all information provided in this application is accurate and complete. I understand that providing false information may lead to rejection or legal action.
          </span>
        </label>
      </div>
    </div>
  );
}

const STATUS_TRACKING = [
  { label: 'Application Submitted',        icon: '📤', done: true,  note: 'Securely transmitted to Cooperative Bank of Oromia via SFTP.' },
  { label: 'Under Review',                 icon: '🔍', done: false, note: 'Loan officer will verify documents and applicant details.' },
  { label: 'Credit Scoring',               icon: '📊', done: false, note: 'Automated credit assessment based on farm data and history.' },
  { label: 'Decision (Approved/Rejected)', icon: '⚖️', done: false, note: 'Final approval or rejection communicated to applicant.' },
  { label: 'Loan Disbursed',               icon: '💰', done: false, note: 'Approved funds transferred to the farmer\'s bank account.' },
];

function SummaryModal({ form, displayId, dateStr, timeStr, onClose }: { form: FormState, displayId: string, dateStr: string, timeStr: string, onClose: () => void }) {
  const farmerName = form.fullName || 'Abebe Kebede';
  const Section = ({ title, icon, children }) => (
    <div className="mb-5">
      <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
        <span className="text-base leading-none">{icon}</span>
        <p className="text-sm font-bold text-gray-800">{title}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">{children}</div>
    </div>
  );
  const F = ({ label, value }) => (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800 break-words">{value || '—'}</p>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-8" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#16A34A] to-[#10883c] px-6 py-5">
          <div>
            <p className="text-lg font-bold text-white">Application Summary</p>
            <p className="text-xs text-white/70">ID: {displayId} · Submitted {dateStr} at {timeStr}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Status strip */}
        <div className="flex items-center gap-3 bg-green-50 border-b border-green-100 px-6 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500">
            <Check size={13} strokeWidth={3} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#10883c]">Submitted &amp; Pending Review</p>
            <p className="text-xs text-green-600">Transmitted to Cooperative Bank of Oromia via SFTP</p>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[60vh] px-6 py-5">
          <Section title="Farmer Information" icon="👤">
            <F label="Full Name"       value={form.fullName} />
            <F label="Father's Name"   value={form.fatherName} />
            <F label="Farmer ID"       value={form.farmerId} />
            <F label="Date of Birth"   value={form.dateOfBirth} />
            <F label="Gender"          value={form.gender} />
            <F label="Marital Status"  value={form.maritalStatus} />
            <F label="Mobile Phone"    value={form.mobilePhone} />
            <F label="Education Level" value={form.educationLevel} />
            <F label="National ID"     value={form.nationalId} />
            <F label="Region"          value={form.region} />
            <F label="Woreda"          value={form.woreda} />
            <F label="Kebele"          value={form.kebele} />
          </Section>
          <Section title="Loan Details" icon="🔒">
            <F label="Loan Type"         value={form.loanType} />
            <F label="Purpose"           value={form.loanPurpose} />
            <F label="Requested Amount"  value={form.requestedAmount ? `ETB ${Number(form.requestedAmount).toLocaleString()}` : ''} />
            <F label="Duration"          value={form.loanDuration} />
            <F label="Primary Crops"     value={(form.primaryCrops || []).join(', ')} />
            <F label="Crop Variety"      value={form.cropVariety} />
            <F label="Land Size"         value={form.landSize ? `${form.landSize} Ha` : ''} />
            <F label="Expected Yield"    value={form.expectedYield ? `${form.expectedYield} Qt` : ''} />
          </Section>
          <Section title="Banking Information" icon="🏦">
            <F label="Bank Account No." value={form.bankAccount} />
            <F label="IFSC / FSC Code"  value={form.ifscCode} />
            <F label="Bank Name"        value={form.bankName} />
            <F label="Account Holder"   value={form.accountHolderName} />
          </Section>
          <Section title="Consent &amp; Fayda" icon="🛡">
            <F label="Fayda ID"         value={form.faydaId} />
            <F label="OTP Verification" value="Verified" />
            <F label="Consented Fields" value={(form.dataFields || []).filter(f => f.checked).map(f => f.label).join(', ')} />
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
          <p className="text-xs text-gray-400">Generated on {dateStr} · {timeStr}</p>
          <button onClick={onClose} className="rounded-xl bg-[#16A34A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#10883c] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const UPDATE_STATUS_OPTIONS = [
  { value: 'submitted',  label: 'Application Submitted', icon: '📤' },
  { value: 'review',     label: 'Under Review',           icon: '🔍' },
  { value: 'scoring',    label: 'Credit Scoring',         icon: '📊' },
  { value: 'decision',   label: 'Decision Made',          icon: '⚖️' },
  { value: 'disbursed',  label: 'Loan Disbursed',         icon: '💰' },
];

function UpdateStatusModal({ currentDoneCount, onUpdate, onClose }: { currentDoneCount: number, onUpdate: () => void, onClose: () => void }) {
  const [selected, setSelected] = useState(currentDoneCount - 1);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Update Application Status</p>
            <p className="text-xs text-gray-400">Select the latest completed stage</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <X size={15} className="text-gray-500" />
          </button>
        </div>
        <div className="flex flex-col gap-2 px-5 py-4">
          {UPDATE_STATUS_OPTIONS.map((opt, idx) => {
            const isSelected = selected === idx;
            const isPast     = idx < selected;
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(idx)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  isSelected
                    ? 'border-[#16A34A] bg-[#16A34A]/5 ring-1 ring-[#16A34A]/30'
                    : isPast
                    ? 'border-green-100 bg-green-50/50'
                    : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected || isPast ? 'border-[#16A34A] bg-[#16A34A]' : 'border-gray-200 bg-white'
                }`}>
                  {isSelected || isPast
                    ? <Check size={12} strokeWidth={3} className="text-white" />
                    : <span className="text-xs">{opt.icon}</span>}
                </div>
                <span className={`text-sm font-medium ${isSelected || isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <span className="ml-auto rounded-full bg-[#16A34A] px-2 py-0.5 text-[10px] font-bold text-white">Current</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            onClick={() => { onUpdate(selected + 1); onClose(); }}
            className="flex-1 rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white hover:bg-[#16A34A] transition-colors">
            Save Status
          </button>
        </div>
      </div>
    </div>
  );
}

function Step7({ form, submittedAt, appId }: { form: FormState, submittedAt: string, appId: string }) {
  const router = useRouter();
  const now        = submittedAt || new Date();
  const dateStr    = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr    = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const displayId  = appId || 'APP-2026-8921';
  const farmerName = form.fullName || 'Abebe Kebede';

  const [showSummary, setShowSummary]   = useState(false);
  const [showUpdate,  setShowUpdate]    = useState(false);
  const [doneCount,   setDoneCount]     = useState(1); // 1 = only "Submitted" done initially

  // Build live tracking list from doneCount
  const trackingItems = STATUS_TRACKING.map((item, idx) => ({ ...item, done: idx < doneCount }));

  function handleDownloadPDF() {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    const crops = (form.primaryCrops || []).join(', ');
    const consented = (form.dataFields || []).filter(f => f.checked).map(f => f.label).join(', ');
    const amount = form.requestedAmount ? `ETB ${Number(form.requestedAmount).toLocaleString()}` : '—';
    const rows = (items) => items.map(([l, v]) =>
      `<tr><td style="padding:6px 12px;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;width:40%;border-bottom:1px solid #f3f4f6">${l}</td>
       <td style="padding:6px 12px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6">${v || '—'}</td></tr>`
    ).join('');
    const section = (title, icon, items) =>
      `<div style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #e5e7eb;">
          <span style="font-size:16px">${icon}</span>
          <span style="font-size:13px;font-weight:700;color:#374151">${title}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #f3f4f6;border-radius:8px;overflow:hidden">${rows(items)}</table>
       </div>`;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Loan Application – ${displayId}</title>
      <style>
        @page { size: A4; margin: 18mm 15mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background:#fff; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>
      <div style="background:linear-gradient(135deg,#4a7c59,#3a6347);padding:28px 32px;border-radius:12px;margin-bottom:24px;color:#fff;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:20px;font-weight:800;margin-bottom:4px;">Loan Application Summary</div>
            <div style="font-size:12px;opacity:.8;">Access to Credit System — Cooperative Bank of Oromia</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:700;">${displayId}</div>
            <div style="font-size:11px;opacity:.75;">${dateStr} · ${timeStr}</div>
          </div>
        </div>
        <div style="margin-top:16px;display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.2);padding:6px 14px;border-radius:99px;">
          <span style="font-size:13px">✓</span>
          <span style="font-size:12px;font-weight:600;">Submitted &amp; Pending Review</span>
        </div>
      </div>
      ${section('Farmer Information','👤',[['Full Name',form.fullName],["Father's Name",form.fatherName],['Farmer ID',form.farmerId],['Date of Birth',form.dateOfBirth],['Gender',form.gender],['Marital Status',form.maritalStatus],['Mobile Phone',form.mobilePhone],['Education Level',form.educationLevel],['National ID',form.nationalId],['Region',form.region],['Woreda',form.woreda],['Kebele',form.kebele]])}
      ${section('Loan Details','🔒',[['Loan Type',form.loanType],['Purpose',form.loanPurpose],['Requested Amount',amount],['Duration',form.loanDuration],['Primary Crops',crops],['Crop Variety',form.cropVariety],['Land Size',form.landSize?form.landSize+' Ha':''],['Expected Yield',form.expectedYield?form.expectedYield+' Qt':'']])}
      ${section('Banking Information','🏦',[['Bank Account No.',form.bankAccount],['IFSC / FSC Code',form.ifscCode],['Bank Name',form.bankName],['Account Holder',form.accountHolderName]])}
      ${section('Consent & Fayda','🛡',[['Fayda ID',form.faydaId],['OTP Verification','Verified'],['Consented Fields',consented]])}
      <div style="margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:10px;color:#9ca3af;">Generated by A2C System · ${dateStr} ${timeStr}</span>
        <span style="font-size:10px;color:#9ca3af;">CONFIDENTIAL — For internal bank use only</span>
      </div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`);
    w.document.close();
  }

  return (
    <>
      {showSummary && (
        <SummaryModal form={form} displayId={displayId} dateStr={dateStr} timeStr={timeStr} onClose={() => setShowSummary(false)} />
      )}
      {showUpdate && (
        <UpdateStatusModal
          currentDoneCount={doneCount}
          onUpdate={n => setDoneCount(n)}
          onClose={() => setShowUpdate(false)}
        />
      )}

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

      {/* ── Left / Success card ── */}
      <div className="lg:col-span-3 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Green header banner */}
        <div className="relative flex flex-col items-center gap-3 overflow-hidden bg-gradient-to-br from-[#16A34A] to-[#10883c] px-6 py-10 text-center">
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
            <Check size={30} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Application Submitted Successfully!</h2>
            <p className="mt-1 text-sm text-white/80">
              The loan application for <span className="font-semibold text-white">{farmerName}</span> has been
              securely transmitted to Coop Bank for review.
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
            <Check size={11} strokeWidth={3} /> Verified &amp; Submitted
          </span>
        </div>

        {/* Meta cards */}
        <div className="grid grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-3">
          {[
            { label: 'Application ID',  value: displayId,               icon: <FileText size={15} className="text-[#4a7c59]" /> },
            { label: 'Submitted On',    value: `${dateStr} ${timeStr}`,  icon: <Calendar size={15} className="text-[#4a7c59]" /> },
            { label: 'Transfer Method', value: 'SFTP Sync',              icon: <Send size={15} className="text-[#4a7c59]" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4a7c59]/10">{icon}</div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-bold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Farmer strip */}
        <div className="mx-6 mb-5 flex items-center gap-3 rounded-xl border border-[#4a7c59]/20 bg-[#4a7c59]/5 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a7c59]/15 text-base">👤</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{farmerName}</p>
            <p className="text-xs text-gray-500">
              {form.loanType || 'Agricultural'} Loan
              {form.requestedAmount ? ` · ETB ${Number(form.requestedAmount).toLocaleString()}` : ''}
              {form.loanDuration    ? ` · ${form.loanDuration}` : ''}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[green-100] px-2.5 py-1 text-xs font-semibold text-[#16A34A]">
            <Check size={10} strokeWidth={3} /> Pending Review
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <Download size={14} /> Download PDF
          </button>
          <button
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <Eye size={14} /> View Summary
          </button>
          <button
            onClick={() => router.push('/loan-application-dashboard')}
            className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#10883c] transition-colors">
            <LayoutDashboard size={14} /> Return to Dashboard
          </button>
        </div>
      </div>

      {/* ── Right / Status tracking card ── */}
      <div className="lg:col-span-2 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Status Tracking</h3>
            <p className="text-[11px] text-gray-400">Real-time application progress</p>
          </div>
          <button
            onClick={() => setShowUpdate(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/5 px-2.5 py-1.5 text-xs font-semibold text-[#16A34A] hover:bg-[#16A34A]/10 transition-colors">
            <Edit2 size={11} /> Update
          </button>
        </div>

        <div className="flex flex-col px-5 py-4">
          {trackingItems.map((item, idx) => {
            const isLast = idx === trackingItems.length - 1;
            return (
              <div key={item.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    item.done ? 'border-[#16A34A] bg-[#16A34A]' : 'border-gray-200 bg-white'
                  }`}>
                    {item.done
                      ? <Check size={13} strokeWidth={3} className="text-white" />
                      : <span className="text-xs leading-none">{item.icon}</span>}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 my-1 min-h-[28px] rounded-full ${item.done ? 'bg-[#16A34A]' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-4'}`}>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${item.done ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</p>
                    {item.done && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Done</span>}
                  </div>
                  {item.done && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-gray-400" />
                      <p className="text-[11px] text-gray-400">{dateStr} · {timeStr}</p>
                    </div>
                  )}
                  {item.note && (
                    <p className={`mt-1 text-xs leading-relaxed ${item.done ? 'text-gray-600' : 'text-gray-400'}`}>{item.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto border-t border-gray-100 bg-blue-50/60 px-5 py-3.5">
          <div className="flex items-start gap-2">
            <Info size={12} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-[11px] leading-relaxed text-blue-700">
              Status updates are synced automatically with Cooperative Bank. You will be notified at each stage.
            </p>
          </div>
        </div>
      </div>

    </div>
    </>
  );
}

export default function NewLoanApplication() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [step5Uploads, setStep5Uploads] = useState({});
  const [submittedAt, setSubmittedAt] = useState(null);
  const [appId, setAppId] = useState(null);


  const [form, setForm] = useState({
    fullName: 'Amit', fatherName: 'Kumar', farmerId: 'FMR-2024-8921',
    nationalId: 'ETH-293829823', dateOfBirth: '1990-01-15', gender: 'Male', maritalStatus: 'Married',
    mobilePhone: '+251 9876543210', educationLevel: 'Graduation', kebele: 'Bishoftu',
    region: 'Oromia', woreda: 'Bishoftu', purposeOfLoan: '',
    zone: 'East Shewa',
    loanType: 'input', loanPurpose: 'Agro-processing (e.g., milling grain)',
    requestedAmount: '', loanDuration: '12 Months (1 Year)', nearestBranch: '',
    primaryCrops: ['Wheat'], cropVariety: 'Seed + S-Hela/Achen + Stellar Star',
    cropAddress: '', quantityRequested: '', unitPrice: '', totalSeedCost: '',
    landSize: '', expectedYield: '', expectedHarvestDate: '',
    fertilizerUsed: '', otherFarmingActivities: 'Cattle, Poultry, Sheep/Goats, Other Income Sources',
    farmerGroup: '', animalReared: '', farmEquipment: '', farmSizeHectares: '',
    harvestAggregatorType: 'primaryCooperative', cooperativeName: '',
    dapQuantity: '', ureaQuantity: '', fertilizerUnitPrice: '', totalFertilizerCost: '',
    agrochemicalType: 'A', cropProtectionQuantity: '', cropProtectionUnitPrice: '', totalCropProtectionCost: '',
    selectedInputSupplier: '', maleFarmerContribution: '', femaleFarmerContribution: '', cropInsurancePremium: '',
    bankAccountName: 'Amit Sharma', bankAccount: '1000245789032', bankName: 'Cooperative Bank of Oromia', bankSwiftCode: 'CBOAETH',
    mobileAccountName: '', mobilePaymentsNumber: '',
    totalBorrowingAmount: '', taxId: '',
    accountHolderName: 'Amit Sharma', ifscCode: 'CBOA0001234',
    faydaId: '722334455', dataFields: [...DATA_FIELDS],
    otpCode: ['', '', '', '', '', ''],
    // Step 3 – Supporting Documents
    marriageStatus: 'married',
    acknowledgeDocDiscrepancy: false,
    // Step 4 – Consent & OTP
    farmerSearch: '',
    consentType: '', consentDuration: '', consentPurposeDetailed: '',
    consentFormFile: null, consentAttachment: null,
    // Step 5 – Farmer Details (Basic Information)
    lastName: 'Sharma', idType: 'Passport', idNumber: '29838928923', language: 'English',
    // Step 5 – Land and Crop Information
    landSizeAcres: '12', farmId: '29838928923', farmPolygon: '',
    landAcreage: '', farmLandNumber: '29838928923',
    // Step 5 – Socio-Economic Information
    sizeOfFamily: '4', numberOfChildren: '3', noOfFemalesFamily: '3', noOfMalesFamily: '3',
    familyMemberOwnsLand: '3', sourceOfIncome: 'Salary',
    // Step 5 – Land Crop and Livestock Information
    totalFarmlandLandowner: '3', totalFarmlandCropSharing: '4', totalFarmlandRented: '3',
    certificationId: '29838928923', certificationPhoto: 'Yes',
    // Step 5 – Agronomic Data
    farmlandSizeHectares: 'Capacity for production', landOwnershipStatus: 'Security of access', soilFertility: 'Future yield potential', moistureLevels: 'Irrigation / drought risks',
  });

  function setField(key: string) { return (val: any) => setForm(prev => ({ ...prev, [key]: val })); }

  function goNext() {
    const errs = {};
    if (currentStep === 5) {
      if (form.dateOfBirth) {
        const dob = new Date(form.dateOfBirth);
        const today = new Date();
        const age18 = new Date(dob.getFullYear() + 18, dob.getMonth(), dob.getDate());
        if (age18 > today) {
          errs.dateOfBirth = 'Farmer must be at least 18 years old.';
        }
      }
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
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
    const id = 'APP-' + now.getFullYear() + '-' + (Math.floor(Math.random() * 9000) + 1000);
    setSubmittedAt(now); setAppId(id);
    const { otpCode, ...serializable } = form;
    const loanTypeLabel = ({
      input: 'Input Financing',
      machinery: 'Machinery / Equipment',
      conventional: 'Conventional',
      alhuda: 'Alhuda (Islamic Financing)',
    })[form.loanType] || form.loanType || 'Agricultural Loan';
    const updatedFmt = now.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    try {
      const existing = JSON.parse(localStorage.getItem('a2c_submitted_loans') || '[]');
      localStorage.setItem('a2c_submitted_loans', JSON.stringify([{
        id,
        applicant: form.fullName || 'Unknown Applicant',
        type: loanTypeLabel,
        status: 'Pending Review',
        statusTone: 'info',
        updated: updatedFmt,
        action: 'View',
        amount: form.requestedAmount,
        phone: form.mobilePhone,
        region: form.region,
        loanTerm: form.loanDuration,
        submittedAt: now.toISOString(),
        formData: serializable,
      }, ...existing]));
    } catch { /* ignore */ }
    setCurrentStep(STEPS.length + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const meta = STEP_META[Math.min(currentStep, STEPS.length) - 1];
  const isSubmitStep = currentStep === STEPS.length;
  const isLastStep = currentStep === STEPS.length + 1;
  const showFaydaBadge = currentStep >= 5 && currentStep <= STEPS.length;

  return (
    <div className="flex flex-col gap-4 pb-8">
      {!isLastStep && (
        <button onClick={goBack} className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${isLastStep ? 'bg-[#16A34A]' : 'bg-[#4B5563]'}`}>
            {isLastStep ? <Check size={18} strokeWidth={2.5} /> : currentStep}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{meta.title}</h1>
              {showFaydaBadge && (
                <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  <Check size={10} strokeWidth={3} /> Verified via Fayda
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{meta.subtitle}</p>
          </div>
        </div>
        {!isLastStep && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button onClick={() => router.push('/loans/new-loan-application')} className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Save Draft</button>
          </div>
        )}
      </div>

      <StepProgressBar currentStep={currentStep} />

      {currentStep === 1 && <Step1 form={form} setField={setField} errors={errors} />}
      {currentStep === 2 && <StepBankDetails form={form} setField={setField} errors={errors} />}
      {currentStep === 3 && <Step5 uploads={step5Uploads} setUploads={setStep5Uploads} form={form} setField={setField} />}
      {currentStep === 4 && <Step3 form={form} setField={setField} errors={errors} />}
      {currentStep === 5 && <StepFarmerDetails form={form} setField={setField} errors={errors} />}
      {currentStep === 6 && <Step6 form={form} uploads={step5Uploads} goToStep={setCurrentStep} />}
      {currentStep === 7 && <Step7 form={form} submittedAt={submittedAt} appId={appId} />}

      {!isLastStep && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {/* Row 1 on mobile / Left on desktop: Save Draft + Auto-saved */}
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-gray-600 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Check size={13} className="text-[#4a7c59]" strokeWidth={2.5} /> Auto-saved
            </span>
          </div>
          {/* Row 2 on mobile / Right on desktop: Previous Step + Next / Submit */}
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
            {currentStep > 1 ? (
              <button onClick={goBack} className="flex items-center gap-1.5 rounded-xl border border-gray-600 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={14} /> Previous Step
              </button>
            ) : <div />}
            {isSubmitStep ? (
              <button onClick={handleSubmit} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#10883c] transition-colors">
                Submit Application <Send size={14} />
              </button>
            ) : currentStep === 4 ? (
              <button onClick={goNext} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#10883c] transition-colors">
                Confirm &amp; Next <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={goNext} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#10883c] transition-colors">
                Next Step <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
