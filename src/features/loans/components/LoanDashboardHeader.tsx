import { memo } from 'react';

const LoanDashboardHeader = memo(() => {
  return (
    <header className="flex flex-col mb-4 bg-white p-5 sm:p-8 rounded-xl border border-gray-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, Abebe</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Manage, filter and process the loan applications pipeline.</p>
      </div>
    </header>
  );
});

LoanDashboardHeader.displayName = 'LoanDashboardHeader';
export default LoanDashboardHeader;
