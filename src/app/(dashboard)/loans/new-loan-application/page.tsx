'use client';

import React from 'react';
import { NewLoanOrchestrator } from '@/features/new-loan/components/NewLoanOrchestrator';

export default function NewLoanApplicationPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <NewLoanOrchestrator />
    </div>
  );
}
