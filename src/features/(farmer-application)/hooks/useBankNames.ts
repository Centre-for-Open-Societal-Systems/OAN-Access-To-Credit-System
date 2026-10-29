"use client";
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { getBankDetails } from '../api/farmerApi';

export function useBankNames(bankIds: ReadonlyArray<string | null | undefined>): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});

  const key = Array.from(new Set(bankIds.filter((id): id is string => !!id)))
    .sort()
    .join('|');

  useEffect(() => {
    if (!key) return;

    let isMounted = true;
    for (const id of key.split('|')) {
      getBankDetails(id)
        .then((res) => {
          const name = res.data?.brand_name || res.data?.bank_name;
          if (isMounted && name) setNames((prev) => ({ ...prev, [id]: name }));
        })
        .catch((err) => {
          logger.warn('Failed to load bank name', { bankId: id, error: err });
        });
    }
    return () => {
      isMounted = false;
    };
  }, [key]);

  return names;
}
