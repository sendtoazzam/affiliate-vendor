'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InsightsIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/vendor-portal/insights/sales-report');
  }, [router]);
  return null;
}