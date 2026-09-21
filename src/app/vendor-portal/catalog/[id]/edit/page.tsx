import React from 'react';
import EditProductPage from '@/components/EditProductPage';

export function generateStaticParams() {
  return [{ id: 'edit' }];
}

export default function Page() {
  return <EditProductPage />;
}