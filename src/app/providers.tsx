'use client';

import React, { useState, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '@/store';
import { hydrate } from '@/features/auth/store/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedUser = localStorage.getItem('auth_user');
        if (cachedUser) {
          store.dispatch(hydrate(JSON.parse(cachedUser)));
        }
      } catch (e) {
        localStorage.removeItem('auth_user');
      }
    }

    if (process.env.NEXT_PUBLIC_API_MOCKING === 'true') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass', // ignore requests to unmocked endpoints (like next.js internal)
        });
      });
    }
  }, []);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReduxProvider>
  );
}
