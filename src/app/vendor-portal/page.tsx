'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorPortalRootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/vendor-portal/dashboard');
  }, [router]);
  return null;
}