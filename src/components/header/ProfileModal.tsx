'use client';
import { selectBankName, selectOfficerName, selectUserKind, setUserImage } from '@/features/auth/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Camera, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getUserProfile, updateProfile, changePassword, type UserProfileResponse } from '@/features/auth/api/authApi';
import { onboardingService } from '@/features/seller/api/onboarding.service';
import { toast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { toProxiedFileUrl } from '@/lib/utils';
import { PHONE_NUMBER_REGEX, splitPhoneNumber, stripLeadingZero, toDigitsOnly } from '@/lib/validation/phone';
import { CountryCodeSelect, type CountryCodeOption } from '@/components/ui/CountryCodeSelect';
import { SelectField } from '@/components/ui/SelectField';

const PROFILE_COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+251', country: 'Ethiopia', flagUrl: '/images/flags/et.svg' },
  { code: '+255', country: 'Tanzania', flagUrl: '/images/flags/tz.svg' },
  { code: '+254', country: 'Kenya', flagUrl: '/images/flags/ke.svg' },
  { code: '+256', country: 'Uganda', flagUrl: '/images/flags/ug.svg' },
  { code: '+250', country: 'Rwanda', flagUrl: '/images/flags/rw.svg' },
  { code: '+1', country: 'United States', flagUrl: '/images/flags/us.svg' },
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
}

export function ProfileModal({ isOpen, onClose, role = 'Admin' }: ProfileModalProps) {
  const dispatch = useAppDispatch();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phoneCountryCode: '+251',
    phoneLocalDigits: '',
    language: 'English',
    gender: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackOfficerName = useAppSelector(selectOfficerName) || 'User';
  const fallbackOrganization = useAppSelector(selectBankName) || 'Organization';
  const userKind = useAppSelector(selectUserKind);

  // A farmer's identity is not A2C's to edit. Name, gender, phone and photo come
  // from the farmer registry and A2C holds a copy, so an edit made here would
  // either be silently overwritten by the next sync or -- worse -- survive it and
  // leave the platform disagreeing with the registry about who someone is.
  //
  // Personal Information only. Security below stays editable for everyone: a
  // password is A2C's own credential, not a registry attribute.
  //
  // This is UX, not an authorization boundary. `oan_a2c.api.auth.update_profile`
  // still accepts these fields from any signed-in user; closing that is a
  // separate backend change.
  const isProfileReadOnly = userKind === 'farmer';
  const phoneCountryFlagUrl = PROFILE_COUNTRY_CODES.find((c) => c.code === formData.phoneCountryCode)?.flagUrl;

  // A locked field looks locked the way this modal already locks one -- the
  // Account Information fields below have always rendered like this.
  const editableFieldClass =
    'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors';
  const lockedFieldClass = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600';

  /** A stored value, or an honest admission that there isn't one. */
  const displayValue = (value: string) => value || 'Not provided';

  const officerName = profile?.personal_information.full_name || formData.full_name || fallbackOfficerName;
  const organization = profile?.account_information.organization || fallbackOrganization;

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      const { countryCode, localDigits } = splitPhoneNumber(data.personal_information.phone_number || '');
      setFormData({
        full_name: data.personal_information.full_name || '',
        phoneCountryCode: countryCode,
        phoneLocalDigits: localDigits,
        language: data.personal_information.language || 'English',
        gender: data.personal_information.gender || '',
      });
      if (data.personal_information.user_image) {
        dispatch(setUserImage(data.personal_information.user_image));
      }
    } catch (error) {
      logger.error('getUserProfile failed', { error });
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) {
      // Signals loading immediately when the fetch starts, not just once it resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadProfile();
    }
  }, [isOpen, loadProfile]);

  const handleSaveProfile = async () => {
    // Only enforce the fresh-entry 10-digit format when the phone was
    // actually edited this session. A stored number may be legitimately 9
    // local digits (E.164 with no trunk 0, e.g. "+251912345678"), and an
    // unrelated save (name/language) shouldn't be blocked by that.
    const originalPhoneNumber = profile?.personal_information.phone_number || '';
    const original = splitPhoneNumber(originalPhoneNumber);
    const phoneChanged =
      formData.phoneCountryCode !== original.countryCode || formData.phoneLocalDigits !== original.localDigits;
    if (!isProfileReadOnly && phoneChanged && !PHONE_NUMBER_REGEX.test(formData.phoneLocalDigits)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    // Untouched: send the original value through byte-for-byte rather than
    // re-deriving it from the split — splitPhoneNumber falls back to +251
    // for any dial code it doesn't recognize, and re-concatenating that
    // fallback would corrupt a legacy/foreign number nobody actually edited.
    const phoneNumber = phoneChanged
      ? `${formData.phoneCountryCode}${stripLeadingZero(formData.phoneLocalDigits)}`
      : originalPhoneNumber;
    try {
      setIsSaving(true);
      const updated = await updateProfile({
        full_name: formData.full_name,
        phone_number: phoneNumber,
        language: formData.language,
        ...(formData.gender ? { gender: formData.gender } : {}),
      });
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      logger.error('updateProfile failed', { error });
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error((error instanceof Error && error.message) || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        // The endpoint expects just the base64 part, not the data URI prefix
        const base64Content = base64Data.split(',')[1] ?? '';

        try {
          const uploadRes = await onboardingService.uploadImage({
            filename: file.name,
            filedata: base64Content,
          });

          if (uploadRes.data?.file_url) {
            const updated = await updateProfile({
              user_image: uploadRes.data.file_url
            });
            setProfile(updated);
            dispatch(setUserImage(uploadRes.data.file_url));
            toast.success('Photo updated successfully');
          }
        } catch (error) {
          logger.error('Photo upload failed', { error });
          toast.error('Failed to upload photo');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      logger.error('Failed to read photo file', { error });
      toast.error('Failed to read file');
      setIsUploading(false);
    }
  };

  const initials = officerName.trim().split(/\s+/).filter(Boolean)
    .map(p => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || 'U';

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#FAFAFA] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-white rounded-t-xl flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Settings & Profile</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your personal details, organization profile, and team members.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#16A34A] animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Loading profile...</p>
            </div>
          ) : (
            <>
              {/* Personal Information Section */}
              <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 p-6 pb-5 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                    {isProfileReadOnly && (
                      <p className="text-sm text-gray-500 mt-1">
                        These details come from the farmer registry and cannot be changed here.
                      </p>
                    )}
                  </div>
                  {/* No Save button in read-only mode. A disabled one would still
                      say "there is a change to save here", which is the claim
                      being withdrawn. */}
                  {!isProfileReadOnly && (
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full sm:w-auto justify-center bg-[#16A34A] hover:bg-[#15803d] disabled:opacity-70 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shrink-0"
                    >
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <span className='font-semibold'>Save Change</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-8 p-6 pt-6">
                  {/* Avatar Column */}
                  <div className="flex flex-col items-center justify-center min-w-[200px]">
                    <div className="relative">
                      {profile?.personal_information.user_image ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm">
                          <Image
                            src={toProxiedFileUrl(profile.personal_information.user_image)!}
                            alt="Profile"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-[#F59E0B] flex items-center justify-center text-white text-3xl font-bold shadow-sm">
                          {initials}
                        </div>
                      )}

                      {!isProfileReadOnly && (
                        <>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-[#16A34A] border-2 border-white rounded-full flex items-center justify-center hover:bg-[#15803d] transition-colors cursor-pointer shadow-sm disabled:opacity-70"
                          >
                            {isUploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                    <h4 className="mt-4 font-bold text-gray-900 text-center">{officerName}</h4>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {profile?.account_information.user_role || role} &middot; {organization}
                    </p>
                    {!isProfileReadOnly && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="mt-3 text-sm font-medium text-[#16A34A] hover:text-[#15803d] transition-colors disabled:opacity-70"
                      >
                        <span className='font-medium'>{isUploading ? 'Uploading...' : 'Upload new photo'}</span>
                      </button>
                    )}
                  </div>

                  {/* Form Column.

                      Read-only renders plain disabled inputs rather than disabled
                      selects: a greyed-out dropdown still reads as a control that
                      is temporarily unavailable, and an unset one would show
                      "Select Gender" - a prompt to fill in a form that is not
                      being offered. The required markers go too; nothing here is
                      required of someone who cannot supply it. */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label htmlFor="profile-full-name" className="block text-sm font-medium text-gray-900 mb-1.5">
                        Full Name {!isProfileReadOnly && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        id="profile-full-name"
                        type="text"
                        value={isProfileReadOnly ? displayValue(formData.full_name) : formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={isProfileReadOnly}
                        className={isProfileReadOnly ? lockedFieldClass : editableFieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-gender" className="block text-sm font-medium text-gray-900 mb-1.5">
                        Gender {!isProfileReadOnly && <span className="text-red-500">*</span>}
                      </label>
                      {isProfileReadOnly ? (
                        <input
                          id="profile-gender"
                          type="text"
                          value={displayValue(formData.gender)}
                          disabled
                          className={lockedFieldClass}
                        />
                      ) : (
                        <SelectField
                          value={formData.gender}
                          onChange={(val) => setFormData({ ...formData, gender: val })}
                          options={[
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' },
                            { label: 'Other', value: 'Other' }
                          ]}
                          placeholder="Select Gender"
                        />
                      )}
                    </div>
                    <div>
                      <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-900 mb-1.5">
                        Phone Number {!isProfileReadOnly && <span className="text-red-500">*</span>}
                      </label>
                      {isProfileReadOnly ? (
                        <div className="flex gap-2">
                          <div
                            aria-hidden="true"
                            className="flex items-center gap-2 w-[110px] shrink-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                          >
                            {phoneCountryFlagUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={phoneCountryFlagUrl} alt="" width={20} height={16} className="w-5 h-4 rounded-sm object-cover" />
                            )}
                            <span>{formData.phoneCountryCode}</span>
                          </div>
                          <input
                            id="profile-phone"
                            type="tel"
                            value={displayValue(formData.phoneLocalDigits)}
                            disabled
                            className={lockedFieldClass}
                          />
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <CountryCodeSelect
                            value={formData.phoneCountryCode}
                            onChange={(code) => setFormData({ ...formData, phoneCountryCode: code })}
                            options={PROFILE_COUNTRY_CODES}
                            showChevron
                            triggerClassName="flex items-center justify-between gap-2 w-[110px] shrink-0 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors cursor-pointer"
                          />
                          <input
                            id="profile-phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={formData.phoneLocalDigits}
                            onChange={(e) => setFormData({ ...formData, phoneLocalDigits: toDigitsOnly(e.target.value) })}
                            placeholder="Enter phone number"
                            className={editableFieldClass}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="profile-language" className="block text-sm font-medium text-gray-900 mb-1.5">
                        Language {!isProfileReadOnly && <span className="text-red-500">*</span>}
                      </label>
                      {isProfileReadOnly ? (
                        <input
                          id="profile-language"
                          type="text"
                          value={displayValue(formData.language)}
                          disabled
                          className={lockedFieldClass}
                        />
                      ) : (
                        <SelectField
                          value={formData.language}
                          onChange={(val) => setFormData({ ...formData, language: val })}
                          options={[
                            { label: 'English', value: 'English' },
                            { label: 'Swahili', value: 'Swahili' },
                            { label: 'Amharic', value: 'Amharic' }
                          ]}
                          placeholder="Select Language"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Account Information Section */}
              <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">User Role</label>
                    <input
                      type="text"
                      value={profile?.account_information.user_role || role}
                      disabled
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Organization</label>
                    <input
                      type="text"
                      value={profile?.account_information.organization || organization}
                      disabled
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Employee Email Address</label>
                    <input
                      type="text"
                      value={profile?.account_information.employee_id || 'N/A'}
                      disabled
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Member Since</label>
                    <input
                      type="text"
                      value={profile?.account_information.member_since || 'N/A'}
                      disabled
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                    />
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-0">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Security</h3>
                    {!isEditingPassword && <p className="text-sm text-gray-500 mt-1">Manage your password and security settings.</p>}
                  </div>
                  <button
                    onClick={() => setIsEditingPassword(!isEditingPassword)}
                    className={`w-full sm:w-auto justify-center ${isEditingPassword ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#16A34A] hover:bg-[#15803d] text-white'} px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0`}
                  >
                    <span className='font-semibold'>{isEditingPassword ? 'Cancel' : 'Update Password'}</span>

                  </button>
                </div>

                {isEditingPassword && (
                  <div className="space-y-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors font-mono tracking-widest text-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors font-mono tracking-widest text-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors font-mono tracking-widest text-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="bg-[#16A34A] hover:bg-[#15803d] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center"
                      >
                        {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Password
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
