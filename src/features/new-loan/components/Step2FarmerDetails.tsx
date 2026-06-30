'use client';

import { logger } from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStepAPI, prevStepAPI, setFormData as setFormDataAction } from '@/features/new-loan/store/newLoanFormSlice';
import { ArrowLeft, ArrowRight, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { maskSensitiveId } from '@/lib/utils';
import { SelectField } from '@/components/ui/SelectField';
import { GENDER_OPTIONS } from '@/features/loans/constants/loans.constants';
import { loanService, type LoanApplicationFull } from '@/features/loans/api/loan.service';
import type { AppDispatch, RootState } from '@/store';

// Every form field is a read-only string input. FORM_SECTIONS (below) is the
// single source of truth for which fields exist; there's no separate interface
// to keep in sync. Keys are the `key` values declared in the field config.
export type FarmerDetails = Record<string, string>;

interface FieldConfig {
  key: string;
  label: string;
  apiKey: string;
  type?: 'text' | 'select';
  options?: typeof GENDER_OPTIONS;
  // Masked by default in the UI (e.g. National/Fayda ID); revealed on demand.
  sensitive?: boolean;
  // If the value from API is comma-separated, display it as a list of items
  isList?: boolean;
}

interface SectionConfig {
  title: string;
  fields: FieldConfig[];
  gridCols?: string;
}

const FORM_SECTIONS: SectionConfig[] = [
  {
    title: 'Loan Details',
    gridCols: 'lg:grid-cols-3',
    fields: [
      { key: 'loanType', label: 'Loan Type', apiKey: 'loan_type' },
      { key: 'loanAmount', label: 'Loan Amount', apiKey: 'loan_amount' },
      { key: 'loanReason', label: 'Loan Reason', apiKey: 'loan_reason' },
    ],
  },
  {
    title: 'Basic Information',
    gridCols: 'lg:grid-cols-3',
    fields: [
      { key: 'firstName', label: 'First Name', apiKey: 'first_name' },
      { key: 'lastName', label: 'Last Name', apiKey: 'last_name' },
      { key: 'mobilePhone', label: 'Mobile Phone', apiKey: 'phone_number' },
      { key: 'dateOfBirth', label: 'Date of Birth', apiKey: 'date_of_birth' },
      { key: 'gender', label: 'Gender', apiKey: 'gender', type: 'select', options: GENDER_OPTIONS },
      { key: 'region', label: 'Region', apiKey: 'region' },
      { key: 'woreda', label: 'Woreda', apiKey: 'woreda' },
      { key: 'kebele', label: 'Kebele', apiKey: 'kebele' },
      { key: 'idType', label: 'ID Type', apiKey: 'id_type' },
      { key: 'idNumber', label: 'ID Number', apiKey: 'id_number', sensitive: true },
      { key: 'language', label: 'Language', apiKey: 'language' },
    ],
  },

  {
    title: 'Socio Economic Information',
    gridCols: 'lg:grid-cols-3',
    fields: [
      { key: 'maritalStatus', label: 'Marital Status', apiKey: 'marital_status' },
      { key: 'sizeOfFamily', label: 'Size of Family', apiKey: 'size_of_family' },
      { key: 'numberOfChildren', label: 'Number of Children', apiKey: 'number_of_children' },
      { key: 'noOfFemales', label: 'No. of Females (Family)', apiKey: 'no_of_females_family' },
      { key: 'noOfMales', label: 'No. of Males (Family)', apiKey: 'no_of_males_family' },
      { key: 'familyMemberOwnsLand', label: 'A Family Member Owns Land Independently', apiKey: 'family_member_owns_land_independently' },
      { key: 'sourceOfIncome', label: 'Source of Income', apiKey: 'source_of_income', isList: true },
      { key: 'educationLevel', label: 'Education Level', apiKey: 'education_level' },
    ],
  },
  {
    title: 'Land, Crop and Livestock Information',
    gridCols: 'lg:grid-cols-3',
    fields: [
      { key: 'totalFarmlandLandowner', label: 'Total Farmland Size as Landowner', apiKey: 'total_farmland_size_as_landowner' },
      { key: 'totalFarmlandCropSharing', label: 'Total Farmland Size as Crop Sharing', apiKey: 'total_farmland_size_as_crop_sharing' },
      { key: 'totalFarmlandRented', label: 'Total Farmland Size as Rented', apiKey: 'total_farmland_size_as_rented' },
      { key: 'certificationId', label: 'Certification ID', apiKey: 'certification_id', isList: true },
      { key: 'certificationPhoto', label: 'Certification Photo', apiKey: 'certification_photo_url' },
    ],
  },
  {
    title: 'Agronomic Data',
    gridCols: 'lg:grid-cols-4',
    fields: [
      { key: 'farmlandSizeHectares', label: 'Farmland Size (Hectares)', apiKey: 'farmland_size_hectares', isList: true },
      { key: 'landOwnershipStatus', label: 'Land Ownership Status', apiKey: 'land_ownership_status' },
    ],
  },
];

// Empty string for every configured field — derived from FORM_SECTIONS so the
// default shape can never drift from the rendered fields.
const DEFAULT_FARMER_DETAILS: FarmerDetails = FORM_SECTIONS.reduce<FarmerDetails>(
  (acc, section) => {
    section.fields.forEach((field) => { acc[field.key] = ''; });
    return acc;
  },
  {},
);

function mapApiToFarmerDetails(data: LoanApplicationFull): FarmerDetails {
  const result: FarmerDetails = {};
  FORM_SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      const val = data[field.apiKey as keyof LoanApplicationFull];
      if (typeof val === 'boolean') {
        result[field.key] = val ? 'Yes' : 'No';
      } else {
        result[field.key] = (val !== undefined && val !== null) ? String(val) : '';
      }
    });
  });
  return result;
}

export function Step2FarmerDetails() {
  const dispatch = useDispatch<AppDispatch>();
  const savedFormData = useSelector((state: RootState) => state.loanForm.formData);
  const applicationId = useSelector((state: RootState) => state.loanForm.applicationId);

  // Initialize with saved Redux state or defaults
  const [formData, setFormData] = useState<FarmerDetails>(() => ({
    ...DEFAULT_FARMER_DETAILS,
    ...(savedFormData || {}),
  }));

  const handleChange = (field: keyof FarmerDetails) => (value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value.toString() }));
  };

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  // Tracks which sensitive fields (by key) the user has chosen to reveal.
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});

  const toggleReveal = (key: string) =>
    setRevealedFields((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    async function loadProfile() {
      if (!applicationId) return;
      try {
        setIsLoadingProfile(true);
        const response = await loanService.getFullProfile(applicationId);
        const data = response?.data || {};

        setFormData(mapApiToFarmerDetails(data));
      } catch (err) {
        logger.error("Failed to load full profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [applicationId]);

  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(setFormDataAction(formData));
    }, 60000); // Auto save every 60 seconds
    return () => clearInterval(timer);
  }, [formData, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFormDataAction(formData));
    dispatch(nextStepAPI());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
      {FORM_SECTIONS.map((section, sectionIdx) => (
        <div key={section.title} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm relative">
          {sectionIdx === 0 && isLoadingProfile && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-6 w-6 animate-spin text-[#16335A]" />
            </div>
          )}
          <h2 className="mb-6 text-sm font-bold text-gray-900 border-b border-gray-200 pb-4">{section.title}</h2>
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${section.gridCols || 'lg:grid-cols-3'}`}>
            {section.fields.map((field) => {
              if (field.type === 'select') {
                return (
                  <SelectField
                    key={field.key}
                    label={field.label}
                    value={formData[field.key] ?? ''}
                    options={field.options || []}
                    onChange={handleChange(field.key)}
                    disabled
                  />
                );
              }
              const rawValue = formData[field.key] ?? '';

              if (field.isList) {
                const listItems = rawValue ? rawValue.split(',').map(s => s.trim()).filter(Boolean) : [];
                return (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-[#16335A] uppercase tracking-wide">{field.label}</label>
                    {listItems.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {listItems.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-[15px] font-medium text-gray-900">
                            {item}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <TextField label="" value="" readOnly />
                    )}
                  </div>
                );
              }

              if (field.sensitive) {
                const isRevealed = !!revealedFields[field.key];
                const displayValue = isRevealed || !rawValue ? rawValue : maskSensitiveId(rawValue);
                return (
                  <div key={field.key} className="relative">
                    <TextField
                      label={field.label}
                      value={displayValue}
                      readOnly
                    />
                    {rawValue && (
                      <button
                        type="button"
                        onClick={() => toggleReveal(field.key)}
                        className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={isRevealed ? `Hide ${field.label}` : `Reveal ${field.label}`}
                      >
                        {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                );
              }
              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  value={rawValue}
                  onChange={handleChange(field.key)}
                  readOnly
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-xl border border-gray-200 bg-white px-4 sm:px-6 py-6 shadow-sm mt-8 relative z-0 gap-6 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[15px] font-normal text-[#16335A]">
            <Check className="h-5 w-5 text-[#16335A]" /> Your progress is saved automatically
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-semibold">
          <button type="button" onClick={() => dispatch(prevStepAPI())} className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-[#16335A] shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Previous Step
          </button>
          <button type="submit" className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md bg-[#16A34A] px-6 py-2.5 text-[15px] font-semibold text-white shadow-sm hover:bg-[#15803d] transition-colors">
            Next Step <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
