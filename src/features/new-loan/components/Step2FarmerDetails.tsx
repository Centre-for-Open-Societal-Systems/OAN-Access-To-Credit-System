import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, prevStep, setFormData as setFormDataAction } from '@/features/new-loan/store/newLoanFormSlice';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { SelectField } from '@/components/ui/SelectField';
import { GENDER_OPTIONS } from '@/features/loans/constants/loans.constants';
import type { AppDispatch, RootState } from '@/store';

export function Step2FarmerDetails() {
  const dispatch = useDispatch<AppDispatch>();
  const savedFormData = useSelector((state: RootState) => state.loanForm.formData);

  // Pre-filling with data from the screenshot mockup, merged with Redux state
  const [formData, setFormData] = useState<Record<string, string>>({
    firstName: 'Abebe Bekele',
    lastName: 'Tadesse',
    mobilePhone: '+251 9876543210',
    dateOfBirth: 'May 15, 1990',
    gender: 'Male',
    woreda: 'Bishoftu',
    kebele: 'Kebele 01',
    idType: 'National ID',
    idNumber: 'ID-987654321',
    language: 'Oromo',
    landSize: '2.5 Hectares',
    farmId: '29838928923',
    farmPolygon: 'Farm Polygon',
    landAcreage: 'Land Acreage',
    farmLandNumber: '29838928923',
    primaryCrop: 'Wheat',
    loanType: 'Input',
    purpose: 'Agro-processing (e.g., milling grain)',
    requestedAmount: '50,000 ETB',
    maritalStatus: 'Married',
    sizeOfFamily: '4',
    numberOfChildren: '3',
    noOfFemales: '3',
    noOfMales: '3',
    familyMemberOwnsLand: '3',
    sourceOfIncome: 'Salary',
    educationLevel: 'Graduation',
    totalFarmlandLandowner: '3',
    totalFarmlandCropSharing: '4',
    totalFarmlandRented: '3',
    certificationId: '29838928923',
    certificationPhoto: 'Yes',
    farmlandSizeHectares: 'Capacity for production',
    landOwnershipStatus: 'Security of access 4',
    soilFertility: 'Future yield potential',
    moistureLevels: 'Irrigation / drought risks',
    ...savedFormData
  });

  const handleChange = (field: string) => (value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value.toString() }));
  };

  const [isSaving, setIsSaving] = useState(false);
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
    dispatch(nextStep());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">

      {/* 1. Basic Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="mb-6 text-sm font-bold text-gray-900 border-b border-gray-200 pb-4">Basic Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="First Name" value={formData.firstName} onChange={handleChange('firstName')} readOnly />
          <TextField label="Last Name" value={formData.lastName} onChange={handleChange('lastName')} readOnly />
          <TextField label="Mobile Phone" value={formData.mobilePhone} onChange={handleChange('mobilePhone')} readOnly />

          <TextField label="Date of Birth" value={formData.dateOfBirth} onChange={handleChange('dateOfBirth')} readOnly />
          <SelectField label="Gender" value={formData.gender} options={GENDER_OPTIONS} onChange={handleChange('gender')} disabled />
          <TextField label="Woreda" value={formData.woreda} onChange={handleChange('woreda')} readOnly />

          <TextField label="Kebele" value={formData.kebele} onChange={handleChange('kebele')} readOnly />
          <TextField label="ID Type" value={formData.idType} onChange={handleChange('idType')} readOnly />
          <TextField label="ID Number" value={formData.idNumber} onChange={handleChange('idNumber')} readOnly />

          <TextField label="Language" value={formData.language} onChange={handleChange('language')} readOnly />
        </div>
      </div>

      {/* 2. Land and Crop Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="mb-6 text-sm font-bold text-gray-900 border-b border-gray-200 pb-4">Land and Crop Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Land Size (Acres)" value={formData.landSize} onChange={handleChange('landSize')} readOnly />
          <TextField label="Farm ID" value={formData.farmId} onChange={handleChange('farmId')} readOnly />
          <TextField label="Farm Polygon" value={formData.farmPolygon} onChange={handleChange('farmPolygon')} readOnly />

          <TextField label="Land Acreage" value={formData.landAcreage} onChange={handleChange('landAcreage')} readOnly />
          <TextField label="Farm Land Number" value={formData.farmLandNumber} onChange={handleChange('farmLandNumber')} readOnly />
        </div>
      </div>

      {/* 3. Socio Economic Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="mb-6 text-sm font-bold text-gray-900 border-b border-gray-200 pb-4">Socio Economic Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Marital Status" value={formData.maritalStatus} onChange={handleChange('maritalStatus')} readOnly />
          <TextField label="Size of Family" value={formData.sizeOfFamily} onChange={handleChange('sizeOfFamily')} readOnly />
          <TextField label="Number of Children" value={formData.numberOfChildren} onChange={handleChange('numberOfChildren')} readOnly />

          <TextField label="No. of Females (Family)" value={formData.noOfFemales} onChange={handleChange('noOfFemales')} readOnly />
          <TextField label="No. of Males (Family)" value={formData.noOfMales} onChange={handleChange('noOfMales')} readOnly />
          <TextField label="A Family Member Owns Land Independently" value={formData.familyMemberOwnsLand} onChange={handleChange('familyMemberOwnsLand')} readOnly />

          <TextField label="Source of Income" value={formData.sourceOfIncome} onChange={handleChange('sourceOfIncome')} readOnly />
          <TextField label="Education Level" value={formData.educationLevel} onChange={handleChange('educationLevel')} readOnly />
        </div>
      </div>

      {/* 4. Land, Crop and Livestock Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="mb-6 text-sm font-bold text-gray-900 border-b border-gray-200 pb-4">Land, Crop and Livestock Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Total Farmland Size as Landowner" value={formData.totalFarmlandLandowner} onChange={handleChange('totalFarmlandLandowner')} readOnly />
          <TextField label="Total Farmland Size as Crop Sharing" value={formData.totalFarmlandCropSharing} onChange={handleChange('totalFarmlandCropSharing')} readOnly />
          <TextField label="Total Farmland Size as Rented" value={formData.totalFarmlandRented} onChange={handleChange('totalFarmlandRented')} readOnly />

          <TextField label="Certification ID" value={formData.certificationId} onChange={handleChange('certificationId')} readOnly />
          <TextField label="Certification Photo" value={formData.certificationPhoto} onChange={handleChange('certificationPhoto')} readOnly />
        </div>
      </div>

      {/* 5. Agronomic Data */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="mb-6 text-sm font-bold text-gray-900 border-b border-gray-200 pb-4">Agronomic Data</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TextField label="Farmland Size (Hectares)" value={formData.farmlandSizeHectares} onChange={handleChange('farmlandSizeHectares')} readOnly />
          <TextField
            label="Land Ownership Status"
            value={formData.landOwnershipStatus}
            onChange={handleChange('landOwnershipStatus')}
            error="* Invalid Characters"
            readOnly
          />
          <TextField label="Soil Fertility / Minerals" value={formData.soilFertility} onChange={handleChange('soilFertility')} readOnly />
          <TextField label="Moisture Levels" value={formData.moistureLevels} onChange={handleChange('moistureLevels')} readOnly />
        </div>
      </div>

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
          <button type="button" onClick={() => dispatch(prevStep())} className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-[#16335A] shadow-sm hover:bg-gray-50 transition-colors">
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
