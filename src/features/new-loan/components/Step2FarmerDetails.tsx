import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStepAPI, prevStepAPI, setFormData as setFormDataAction } from '@/features/new-loan/store/newLoanFormSlice';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { SelectField } from '@/components/ui/SelectField';
import { GENDER_OPTIONS } from '@/features/loans/constants/loans.constants';
import { loanService } from '@/features/loans/api/loan.service';
import type { AppDispatch, RootState } from '@/store';

const DEFAULT_FARMER_DETAILS = {
  firstName: '',
  lastName: '',
  mobilePhone: '',
  dateOfBirth: '',
  gender: '',
  woreda: '',
  kebele: '',
  idType: '',
  idNumber: '',
  language: '',
  landSize: '',
  farmId: '',
  farmPolygon: '',
  landAcreage: '',
  farmLandNumber: '',
  maritalStatus: '',
  sizeOfFamily: '',
  numberOfChildren: '',
  noOfFemales: '',
  noOfMales: '',
  familyMemberOwnsLand: '',
  sourceOfIncome: '',
  educationLevel: '',
  totalFarmlandLandowner: '',
  totalFarmlandCropSharing: '',
  totalFarmlandRented: '',
  certificationId: '',
  certificationPhoto: '',
  farmlandSizeHectares: '',
  landOwnershipStatus: '',
  soilFertility: '',
  moistureLevels: '',
};

type FarmerDetails = typeof DEFAULT_FARMER_DETAILS;

const API_FIELD_MAP: Record<keyof FarmerDetails, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  mobilePhone: 'phone_number',
  dateOfBirth: 'date_of_birth',
  gender: 'gender',
  woreda: 'woreda',
  kebele: 'kebele',
  idType: 'id_type',
  idNumber: 'id_number',
  language: 'language',
  landSize: 'land_size',
  farmId: 'farm_id',
  farmPolygon: 'farm_polygon',
  landAcreage: 'land_acreage',
  farmLandNumber: 'farm_land_number',
  maritalStatus: 'marital_status',
  sizeOfFamily: 'size_of_family',
  numberOfChildren: 'number_of_children',
  noOfFemales: 'no_of_females_family',
  noOfMales: 'no_of_males_family',
  familyMemberOwnsLand: 'family_member_owns_land_independently',
  sourceOfIncome: 'source_of_income',
  educationLevel: 'education_level',
  totalFarmlandLandowner: 'total_farmland_size_as_landowner',
  totalFarmlandCropSharing: 'total_farmland_size_as_crop_sharing',
  totalFarmlandRented: 'total_farmland_size_as_rented',
  certificationId: 'certification_id',
  certificationPhoto: 'certification_photo_url',
  farmlandSizeHectares: 'farmland_size_hectares',
  landOwnershipStatus: 'land_ownership_status',
  soilFertility: 'soil_fertility_minerals',
  moistureLevels: 'moisture_levels',
};

interface FieldConfig {
  key: keyof FarmerDetails;
  label: string;
  type?: 'text' | 'select';
  options?: typeof GENDER_OPTIONS;
}

interface SectionConfig {
  title: string;
  fields: FieldConfig[];
  gridCols?: string;
}

const FORM_SECTIONS: SectionConfig[] = [
  {
    title: 'Basic Information',
    gridCols: 'lg:grid-cols-3',
    fields: [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'mobilePhone', label: 'Mobile Phone' },
      { key: 'dateOfBirth', label: 'Date of Birth' },
      { key: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
      { key: 'woreda', label: 'Woreda' },
      { key: 'kebele', label: 'Kebele' },
      { key: 'idType', label: 'ID Type' },
      { key: 'idNumber', label: 'ID Number' },
      { key: 'language', label: 'Language' },
    ],
  },
  {
    title: 'Land and Crop Information',
    gridCols: 'lg:grid-cols-3',
    fields: [
      { key: 'landSize', label: 'Land Size (Acres)' },
      { key: 'farmId', label: 'Farm ID' },
      { key: 'farmPolygon', label: 'Farm Polygon' },
      { key: 'landAcreage', label: 'Land Acreage' },
      { key: 'farmLandNumber', label: 'Farm Land Number' },
    ],
  },
  {
    title: 'Socio Economic Information',
    gridCols: 'lg:grid-cols-3',
    fields: [
      { key: 'maritalStatus', label: 'Marital Status' },
      { key: 'sizeOfFamily', label: 'Size of Family' },
      { key: 'numberOfChildren', label: 'Number of Children' },
      { key: 'noOfFemales', label: 'No. of Females (Family)' },
      { key: 'noOfMales', label: 'No. of Males (Family)' },
      { key: 'familyMemberOwnsLand', label: 'A Family Member Owns Land Independently' },
      { key: 'sourceOfIncome', label: 'Source of Income' },
      { key: 'educationLevel', label: 'Education Level' },
    ],
  },
  {
    title: 'Land, Crop and Livestock Information',
    gridCols: 'lg:grid-cols-3',
    fields: [
      { key: 'totalFarmlandLandowner', label: 'Total Farmland Size as Landowner' },
      { key: 'totalFarmlandCropSharing', label: 'Total Farmland Size as Crop Sharing' },
      { key: 'totalFarmlandRented', label: 'Total Farmland Size as Rented' },
      { key: 'certificationId', label: 'Certification ID' },
      { key: 'certificationPhoto', label: 'Certification Photo' },
    ],
  },
  {
    title: 'Agronomic Data',
    gridCols: 'lg:grid-cols-4',
    fields: [
      { key: 'farmlandSizeHectares', label: 'Farmland Size (Hectares)' },
      { key: 'landOwnershipStatus', label: 'Land Ownership Status' },
      { key: 'soilFertility', label: 'Soil Fertility / Minerals' },
      { key: 'moistureLevels', label: 'Moisture Levels' },
    ],
  },
];

function mapApiToFarmerDetails(data: Record<string, any>): FarmerDetails {
  const result = {} as FarmerDetails;
  (Object.keys(API_FIELD_MAP) as Array<keyof FarmerDetails>).forEach((key) => {
    const apiKey = API_FIELD_MAP[key];
    const val = data[apiKey];
    result[key] = (val !== undefined && val !== null) ? val.toString() : '';
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

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!applicationId) return;
      try {
        setIsLoadingProfile(true);
        const response = await loanService.getFullProfile(applicationId);
        const data = response?.data || {};
        
        setFormData(mapApiToFarmerDetails(data));
      } catch (err) {
        console.error("Failed to load full profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [applicationId]);

  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleSaveDraft = () => {
    setIsSaving(true);
    dispatch(setFormDataAction(formData));
    setTimeout(() => {
      setIsSaving(false);
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaved(`Auto-saved at ${timeString}`);
    }, 1000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveDraft();
    }, 60000); // Auto save every 60 seconds
    return () => clearInterval(timer);
  }, [formData]);

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
                    value={formData[field.key]}
                    options={field.options || []}
                    onChange={handleChange(field.key)}
                    disabled
                  />
                );
              }
              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  value={formData[field.key]}
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
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="rounded-md border border-[#16335A] px-5 py-2.5 text-[15px] font-bold text-[#16335A] hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[15px] font-normal text-[#16335A]">
            <Check className="h-5 w-5 text-[#16335A]" /> {lastSaved || 'Auto-saved'}
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
