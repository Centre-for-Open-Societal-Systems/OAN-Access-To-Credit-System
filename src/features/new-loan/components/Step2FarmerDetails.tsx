import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { nextStep, prevStep } from '@/features/new-loan/store/newLoanFormSlice';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { SelectField } from '@/components/ui/SelectField';
import { GENDER_OPTIONS, MARITAL_OPTIONS, EDUCATION_OPTIONS, REGIONS } from '@/features/loans/constants/loans.constants';
import type { AppDispatch } from '@/store';

export function Step2FarmerDetails() {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<Record<string, string>>({ 
    fullName: '', fatherName: '', mobilePhone: '', gender: '', maritalStatus: '', educationLevel: '', idNumber: '', region: '', woreda: '', kebele: '' 
  });

  const handleChange = (key: string) => (val: string) => setFormData(f => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(nextStep());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <h2 className="mb-5 border-b border-gray-200 pb-4 text-base font-semibold text-gray-800">Basic Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Full Name" value={formData.fullName} onChange={handleChange('fullName')} required />
          <TextField label="Father's Name" value={formData.fatherName} onChange={handleChange('fatherName')} required />
          <TextField label="Mobile Phone" value={formData.mobilePhone} onChange={handleChange('mobilePhone')} required />
          <SelectField label="Gender" value={formData.gender} options={GENDER_OPTIONS} onChange={handleChange('gender')} required />
          <SelectField label="Marital Status" value={formData.maritalStatus} options={MARITAL_OPTIONS} onChange={handleChange('maritalStatus')} required />
          <SelectField label="Education Level" value={formData.educationLevel} options={EDUCATION_OPTIONS} onChange={handleChange('educationLevel')} required />
          <TextField label="National ID Number" value={formData.idNumber} onChange={handleChange('idNumber')} required />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <h2 className="mb-5 border-b border-gray-200 pb-4 text-base font-semibold text-gray-800">Address Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField label="Region" value={formData.region} options={[...REGIONS]} onChange={handleChange('region')} required />
          <TextField label="Woreda" value={formData.woreda} onChange={handleChange('woreda')} required />
          <TextField label="Kebele / Ward" value={formData.kebele} onChange={handleChange('kebele')} required />
        </div>
      </div>

      <div className="mt-6 flex justify-between border-t border-gray-100 pt-6">
        <button type="button" onClick={() => dispatch(prevStep())} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200">
          <ArrowLeft size={16} /> Back
        </button>
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#15803d] transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/50">
          Save & Continue <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
