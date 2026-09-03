'use client';

import { onboardingService, type BankProfile } from '@/features/seller/api/onboarding.service';
import { POSTAL_CODE_MAX_LENGTH } from '@/features/seller/constants/field-limits';
import { toast } from '@/lib/toast';
import { toProxiedFileUrl } from '@/lib/utils';
import { ArrowRight, Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const inputClass = (disabled: boolean) =>
  `w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#16A34A] ${disabled ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-900'
  }`;

export default function OrganizationManagementTab({ readOnly = false }: { readOnly?: boolean }) {
  const [profile, setProfile] = useState<BankProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onboardingService.getBankProfile()
      .then((res) => setProfile(res.data))
      .catch(() => toast.error('Failed to load organization profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly && profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!profile || readOnly) return;
    setSaving(true);
    try {
      await onboardingService.updateBankProfile({
        bank_name: profile.bank_name,
        ...(profile.brand_name !== undefined && { brand_name: profile.brand_name }),
        ...(profile.website !== undefined && { website: profile.website }),
        registered_street: profile.registered_street,
        ...(profile.registered_kebele_village !== undefined && { registered_kebele_village: profile.registered_kebele_village }),
        ...(profile.registered_woreda_district !== undefined && { registered_woreda_district: profile.registered_woreda_district }),
        registered_zone: profile.registered_zone,
        registered_region: profile.registered_region,
        registered_postal_code: profile.registered_postal_code,
        registered_email: profile.registered_email,
        registered_phone: profile.registered_phone,
        ...(logoPreview || profile.logo ? { logo: logoPreview || profile.logo } : {}),
      });
      toast.success('Organization profile updated successfully');
    } catch (err) {
      toast.error((err instanceof Error && err.message) || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setLogoPreview(dataUri); // show preview immediately
      try {
        const res = await onboardingService.uploadImage({
          filename: file.name,
          filedata: dataUri.split(',')[1] ?? '',
        });
        if (res?.data?.file_url) {
          setLogoPreview(res.data.file_url); // replace preview with the real URL
        }
      } catch (err) {
        toast.error((err instanceof Error && err.message) || 'Failed to upload logo');
        setLogoPreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="py-12 text-center text-gray-500 font-medium bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">Loading organization details...</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-300">

      {/* SECTION 1: Organization Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Organization Details</h2>
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#fff] border border-[#16A34A] hover:bg-[#16A34A] text-[#16A34A] hover:text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <span className='font-semibold'>{saving ? 'Saving...' : 'Save Change'}</span>
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {[
            { label: 'Legal Name', name: 'bank_name', placeholder: 'Ethiopia OpenAgriNet PLC', required: true },
            { label: 'Registration Number', name: 'bank_code', placeholder: 'REG-ET-20231042', required: true },
            { label: 'Street address', name: 'registered_street', placeholder: 'Enter Street address', required: true },
            { label: 'Kebele / Village', name: 'registered_kebele_village', placeholder: 'Enter Kebele / Village' },
            { label: 'Woreda / District', name: 'registered_woreda_district', placeholder: 'Enter Woreda / District' },
            { label: 'Zone', name: 'registered_zone', placeholder: 'Enter Zone', required: true },
            { label: 'Region', name: 'registered_region', placeholder: 'Enter Region', required: true },
            { label: 'Postal code', name: 'registered_postal_code', placeholder: 'Enter Postal code', required: true, maxLength: POSTAL_CODE_MAX_LENGTH },
            { label: 'Organization Type', name: 'entity_type', placeholder: 'e.g. Bank, Microfinance Institution', required: true },
            { label: 'Website URL', name: 'website', placeholder: 'https://www.example.com', type: 'text' },
          ].map(({ label, name, placeholder, required, type, maxLength }) => (
            <div key={name}>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={type ?? 'text'}
                name={name}
                value={(profile as unknown as Record<string, string>)[name] || ''}
                onChange={handleChange}
                disabled={readOnly}
                placeholder={placeholder}
                maxLength={maxLength}
                className={inputClass(readOnly)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Branding */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Branding</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 items-start md:items-end w-full">

            {/* Left half: Logo and Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                  {logoPreview || profile.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- logoPreview can be a data: URL (fresh selection, needs `unoptimized` on next/image, unverified without a browser here)
                    <img src={toProxiedFileUrl(logoPreview || profile.logo)} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#16A34A] font-bold text-lg">oan</span>
                  )}
                </div>
                {!readOnly && (
                  <>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#16A34A] rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-[#15803d] transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </>
                )}
              </div>
              <div className="pb-2">
                <p className="font-bold text-gray-900 text-sm">{profile.brand_name || profile.bank_name || 'Ethiopia OpenAgriNet'}</p>
                {!readOnly && (
                  <button onClick={() => logoInputRef.current?.click()} className="text-[#16A34A] text-xs font-semibold hover:underline mt-0.5">
                    Upload new photo
                  </button>
                )}
              </div>
            </div>

            {/* Right half: Display Name and Save Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand_name"
                  value={profile.brand_name || profile.bank_name || ''}
                  onChange={handleChange}
                  disabled={readOnly}
                  placeholder="Ethiopia OpenAgriNet"
                  className={inputClass(readOnly)}
                />
              </div>
              {!readOnly && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto bg-[#fff] border border-[#16A34A] hover:bg-[#16A34A] text-[#16A34A] hover:text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shrink-0"
                >
                  <span className='font-semibold'>Save Change</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* SECTION 3: KYC / Compliance — hidden per requirements */}

      {/* SECTION 4: Bottom save banner — admin only */}
      {!readOnly && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex justify-end shadow-sm">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#16A34A] hover:bg-[#15803d] text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <span className='font-semibold'>Update Organization Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
