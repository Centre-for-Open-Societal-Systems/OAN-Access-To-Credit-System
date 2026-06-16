'use client';

import { useState, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';
import { hydrate } from '@/features/auth/store/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {

  const [mswReady, setMswReady] = useState(
    process.env.NEXT_PUBLIC_API_MOCKING !== 'true'
  );

  useEffect(() => {
    try {
      const cachedUser = sessionStorage.getItem('auth_user');
      if (cachedUser) {
        store.dispatch(hydrate(JSON.parse(cachedUser)));
      }
    } catch (e) {
      sessionStorage.removeItem('auth_user');
    }

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
            console.error(err);
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
