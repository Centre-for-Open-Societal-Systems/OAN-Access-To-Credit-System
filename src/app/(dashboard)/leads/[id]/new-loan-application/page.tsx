'use client';

import React, { use } from 'react';
import { NewLoanOrchestrator } from '@/features/new-loan/components/NewLoanOrchestrator';

export default function NewLoanApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <div>
      <NewLoanOrchestrator leadId={resolvedParams.id} />
    </div>
  );
}
