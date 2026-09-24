'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import PreloaderBar from '@/components/PreloaderBar';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PreloaderBar />
      {children}
    </AuthProvider>
  );
}
