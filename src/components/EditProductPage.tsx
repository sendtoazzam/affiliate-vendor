'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { vendorApi } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductForm from '@/components/ProductForm';
import VendorLoader from '@/components/VendorLoader';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await vendorApi.getProduct(id);
        const item = res.data || res.product || res;
        setProduct(item);
      } catch (err: any) {
        console.error('Failed to load product', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <VendorLoader
        fullScreen={false}
        label="Product Catalog Manager"
        sublabel="Loading product specs, media and pricing tiers..."
      />
    );
  }

  if (error || !product) {
    return (
      <div className="card bg-base-100 border border-base-300 p-8 text-center max-w-md mx-auto my-12">
        <p className="text-error font-semibold text-sm mb-2">{error || 'Product not found'}</p>
        <p className="text-xs text-base-content/60 mb-4">The product may have been deleted or moved.</p>
        <Link href="/vendor-portal/catalog/manage-product" className="btn btn-sm btn-primary text-white">Back to Products</Link>
      </div>
    );
  }

  return <ProductForm initialData={product} isEditing={true} />;
}
