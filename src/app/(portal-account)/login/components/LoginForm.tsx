'use client';

import { ArrowRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLE_ROUTES: Record<string, string> = {
  farmer: '/login/farmer',
  bank: '/login/bank-admin',
  agent: '/login/bank-agent',
  'dev-agent': '/login/development-agent',
  admin: '/login/administrator',
};

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState('farmer');

  const handleSignInSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(ROLE_ROUTES[role] ?? '/');
  };

  return (
    <div className="max-w-[480px] mx-auto w-full flex-grow flex flex-col justify-center">
      <div className="text-center mb-10">
        <h2 className="text-[32px] font-extrabold text-gray-900 mb-3 tracking-tight">Welcome to the Portal</h2>
        <p className="text-gray-500 text-[15px] font-medium leading-relaxed px-4">Select your role to access the agricultural credit system network.</p>
      </div>

      {/* Role Selectors */}
      <div className="space-y-4 mb-8">
        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:ring-offset-2 ${role === 'farmer' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
          <div className="w-12 h-12 rounded-full bg-[#E8F8EE] flex items-center justify-center mr-4 shrink-0 overflow-hidden">
            <Image src="/images/icons/farmer-applicant.png" alt="Farmer Applicant" width={48} height={48} className="w-12 h-12 object-contain" />
          </div>
          <div className="flex-grow">
            <div className="font-bold text-gray-900 text-[15px]">Farmer Applicant</div>
            <div className="text-[14px] text-gray-500 font-medium mt-0.5">Ethiopia OAN Farmer Portal</div>
          </div>
          <input type="radio" name="role" value="farmer" checked={role === 'farmer'} onChange={() => setRole('farmer')} className="sr-only" />
          {role === 'farmer' ? (
            <CheckCircle className="w-6 h-6 text-[#16A34A]" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
          )}
        </label>

        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:ring-offset-2 ${role === 'bank' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4 shrink-0 overflow-hidden">
            <Image src="/images/icons/bank-admin.png" alt="Bank Admin" width={48} height={51} className="w-12 h-12 object-contain" />
          </div>
          <div className="flex-grow">
            <div className="font-bold text-gray-900 text-[15px]">Bank </div>
            <div className="text-[14px] text-gray-500 font-medium mt-0.5">Manage system setting and user access</div>
          </div>
          <input type="radio" name="role" value="bank" checked={role === 'bank'} onChange={() => setRole('bank')} className="sr-only" />
          {role === 'bank' ? (
            <CheckCircle className="w-6 h-6 text-[#16A34A]" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
          )}
        </label>

        {/* <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:ring-offset-2 ${role === 'agent' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
          <div className="w-12 h-12 rounded-full bg-[#E8F8EE] flex items-center justify-center mr-4 shrink-0 overflow-hidden">
            <Image src="/images/icons/bank-agent.png" alt="Bank Agent" width={48} height={51} className="w-12 h-12 object-contain" />
          </div>
          <div className="flex-grow">
            <div className="font-bold text-gray-900 text-[15px]">Bank Agent</div>
            <div className="text-[14px] text-gray-500 font-medium mt-0.5">Process and manage loan application</div>
          </div>
          <input type="radio" name="role" value="agent" checked={role === 'agent'} onChange={() => setRole('agent')} className="sr-only" />
          {role === 'agent' ? (
            <CheckCircle className="w-6 h-6 text-[#16A34A]" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
          )}
        </label> */}

        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:ring-offset-2 ${role === 'dev-agent' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
          <div className="w-12 h-12 rounded-full bg-[#FFF4E5] flex items-center justify-center mr-4 shrink-0 overflow-hidden">
            <div className="text-2xl">🚜</div>
          </div>
          <div className="flex-grow">
            <div className="font-bold text-gray-900 text-[15px]">Development Agent</div>
            <div className="text-[14px] text-gray-500 font-medium mt-0.5">Support farmer outreach and data collection</div>
          </div>
          <input type="radio" name="role" value="dev-agent" checked={role === 'dev-agent'} onChange={() => setRole('dev-agent')} className="sr-only" />
          {role === 'dev-agent' ? (
            <CheckCircle className="w-6 h-6 text-[#16A34A]" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
          )}
        </label>

        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:ring-offset-2 ${role === 'admin' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
          <div className="w-12 h-12 rounded-full bg-[#F5F3FF] flex items-center justify-center mr-4 shrink-0 overflow-hidden">
            <div className="text-2xl">⚙️</div>
          </div>
          <div className="flex-grow">
            <div className="font-bold text-gray-900 text-[15px]">Administrator</div>
            <div className="text-[14px] text-gray-500 font-medium mt-0.5">Monitor activity and manage system access</div>
          </div>
          <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="sr-only" />
          {role === 'admin' ? (
            <CheckCircle className="w-6 h-6 text-[#16A34A]" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
          )}
        </label>
      </div>

      {/* Login Form */}
      <form className="mb-10" onSubmit={handleSignInSubmit}>
        <button
          type="submit"
          className="w-full bg-[#16A34A] hover:bg-[#158e41] text-white text-base font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 group shadow-sm cursor-pointer"
        >
          <span className='font-semibold'> Next Step</span>

          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {/* Partner Banks */}
      <div className="text-center mt-auto">
        <div className="text-[12px] font-bold text-gray-400 capitalize mb-3">Partner Banks</div>
        <div className="flex items-center justify-center flex-wrap gap-1.5">
          {['CBE', 'Dashen', 'Awash', 'CBO', 'Abyssinia', 'OIB'].map((bank) => (
            <span key={bank} className="px-4 py-1.5 rounded-full border border-[#16A34A]/30 text-[11px] font-bold text-[#16A34A] cursor-default bg-[#F7FFFB]">
              {bank}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
