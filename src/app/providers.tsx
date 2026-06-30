'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';
import { getMeThunk } from '@/features/auth/store/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {

  const [mswReady, setMswReady] = useState(
    process.env.NEXT_PUBLIC_API_MOCKING !== 'true'
  );

  useEffect(() => {
    store.dispatch(getMeThunk());

    if (process.env.NEXT_PUBLIC_API_MOCKING === 'true') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass', // ignore requests to unmocked endpoints
        }).then(() => {
          setMswReady(true);
        }).catch((err) => {
          // Ignore 'already enabled' error in React Strict Mode double-invocation
          if (err.message && err.message.includes('already enabled')) {
            setMswReady(true);
          } else {
            logger.error(err);
          }
        });
      });
    }
  }, []);

  if (!mswReady) {
    return null; // Or a loading spinner
  }

  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  );
}
