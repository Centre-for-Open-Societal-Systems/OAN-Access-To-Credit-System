import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStepAPI, prevStepAPI, setFormData as setFormDataAction } from '@/features/new-loan/store/newLoanFormSlice';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { SelectField } from '@/components/ui/SelectField';
import { GENDER_OPTIONS } from '@/features/loans/constants/loans.constants';
import { loanService } from '@/features/loans/api/loan.service';
import type { AppDispatch, RootState } from '@/store';

export function Step2FarmerDetails() {
  const dispatch = useDispatch<AppDispatch>();
  const savedFormData = useSelector((state: RootState) => state.loanForm.formData);
  const applicationId = useSelector((state: RootState) => state.loanForm.applicationId);

  // Initialize with saved Redux state or an empty object
  const [formData, setFormData] = useState<Record<string, string>>(savedFormData || {});

  const handleChange = (field: string) => (value: string | number) => {
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
        const data = response?.message?.data || response?.data || {};
        
        setFormData(prev => ({
          ...prev,
          firstName: data.first_name || prev.firstName || '',
          lastName: data.last_name || prev.lastName || '',
          mobilePhone: data.phone_number || prev.mobilePhone || '',
          dateOfBirth: data.date_of_birth || prev.dateOfBirth || '',
          gender: data.gender || prev.gender || '',
          woreda: data.woreda || prev.woreda || '',
          kebele: data.kebele || prev.kebele || '',
          idType: data.id_type || prev.idType || '',
          idNumber: data.id_number || prev.idNumber || '',
          language: data.language || prev.language || '',
          landSize: data.land_size || prev.landSize || '',
          farmId: data.farm_id || prev.farmId || '',
          farmPolygon: data.farm_polygon || prev.farmPolygon || '',
          landAcreage: data.land_acreage || prev.landAcreage || '',
          farmLandNumber: data.farm_land_number || prev.farmLandNumber || '',
          maritalStatus: data.marital_status || prev.maritalStatus || '',
          sizeOfFamily: data.size_of_family?.toString() || prev.sizeOfFamily || '',
          numberOfChildren: data.number_of_children?.toString() || prev.numberOfChildren || '',
          noOfFemales: data.no_of_females_family?.toString() || prev.noOfFemales || '',
          noOfMales: data.no_of_males_family?.toString() || prev.noOfMales || '',
          familyMemberOwnsLand: data.family_member_owns_land_independently?.toString() || prev.familyMemberOwnsLand || '',
          sourceOfIncome: data.source_of_income || prev.sourceOfIncome || '',
          educationLevel: data.education_level || prev.educationLevel || '',
          totalFarmlandLandowner: data.total_farmland_size_as_landowner?.toString() || prev.totalFarmlandLandowner || '',
          totalFarmlandCropSharing: data.total_farmland_size_as_crop_sharing?.toString() || prev.totalFarmlandCropSharing || '',
          totalFarmlandRented: data.total_farmland_size_as_rented?.toString() || prev.totalFarmlandRented || '',
          certificationId: data.certification_id || prev.certificationId || '',
          certificationPhoto: data.certification_photo_url || prev.certificationPhoto || '',
          farmlandSizeHectares: data.farmland_size_hectares?.toString() || prev.farmlandSizeHectares || '',
          landOwnershipStatus: data.land_ownership_status || prev.landOwnershipStatus || '',
          soilFertility: data.soil_fertility_minerals || prev.soilFertility || '',
          moistureLevels: data.moisture_levels || prev.moistureLevels || '',
        }));
      } catch (err) {
        console.error("Failed to load full profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    // Only load if we haven't already populated these basic fields from Redux to avoid overwriting edits unnecessarily.
    // Given the form fields are mostly readOnly, this is safe to run on mount.
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

      {/* 1. Basic Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm relative">
        {isLoadingProfile && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
            <Loader2 className="h-6 w-6 animate-spin text-[#16335A]" />
          </div>
        )}
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
