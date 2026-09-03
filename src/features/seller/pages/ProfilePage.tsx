'use client';

// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectUserKind } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { ArrowLeft, Building2, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import OrganizationManagementTab from '../components/profile/OrganizationManagementTab';
import TeamManagementTab from '../components/profile/TeamManagementTab';

function ProfilePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userKind = useAppSelector(selectUserKind);
  const canManageTeam = userKind === 'bank_admin';
  const activeTab = canManageTeam && searchParams.get('tab') === 'team' ? 'team' : 'organization';

  const handleTabChange = (tab: 'organization' | 'team') => {
    router.push(`/profile?tab=${tab}`);
  };

  return (
    // Header and sidebar come from the bank-admin layout — this page used to
    // render its own top nav and no sidebar at all, which made it the one screen
    // in the portal you couldn't navigate away from except by the back link.
    <div className="w-full min-w-0 mx-auto space-y-6 overflow-x-hidden">
      {/* Back Link */}
      <div className='mb-4'>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header Card & Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-6 border-b border-gray-200 px-6 pt-4 pb-0 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleTabChange('organization')}
            className={`flex items-center gap-2 text-sm transition-colors pb-1 whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${activeTab === 'organization'
              ? 'text-[#16A34A] border-b-2 border-[#16A34A] font-semibold'
              : 'text-gray-500 hover:text-gray-800 font-medium'
              }`}
          >
            <Building2 className="w-4 h-4" />
            <span className='font-semibold'>Organization Profile</span>
          </button>

          {canManageTeam && (
            <button
              onClick={() => handleTabChange('team')}
              className={`flex items-center gap-2 text-sm transition-colors pb-1 whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${activeTab === 'team'
                ? 'text-[#16A34A] border-b-2 border-[#16A34A] font-semibold'
                : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
            >
              <UsersRound className="w-4 h-4" />
              <span className='font-semibold'>Team Management</span>
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">
            {activeTab === 'organization' ? 'Organization profile' : 'Team Members'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'organization'
              ? 'Org data is collected during registration (Organisation Section) but cannot be viewed or updated afterward.'
              : 'Manage your organization team members, roles, and account statuses.'}
          </p>
        </div>
      </div>

      {/* Tab Component Content */}
      {activeTab === 'organization' || !canManageTeam ? (
        <OrganizationManagementTab readOnly={!canManageTeam} />
      ) : (
        <TeamManagementTab />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <ProfilePageInner />
    </Suspense>
  );
}
