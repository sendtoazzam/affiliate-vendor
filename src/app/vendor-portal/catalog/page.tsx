'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CatalogIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/vendor-portal/catalog/manage-product');
  }, [router]);
  return null;
}