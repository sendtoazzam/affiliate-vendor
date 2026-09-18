import { redirect } from 'next/navigation';

export default function CatalogIndexPage() {
  redirect('/vendor-portal/catalog/manage-product');
}