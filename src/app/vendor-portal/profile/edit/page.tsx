'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { vendorApi } from '@/lib/api';
import {
  User,
  Building2,
  CreditCard,
  Phone,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
} from 'lucide-react';

export default function EditVendorProfilePage() {
  const router = useRouter();
  const { user, brand, refreshBrand } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    username: '',

    brand_name: '',
    slug: '',
    description: '',
    logo_url: '',

    contact_name: '',
    contact_email: '',
    contact_phone: '',

    bank_name: '',
    bank_account_holder: '',
    bank_account_number: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await vendorApi.getProfile();
        const b = data?.brand || brand;
        const u = data?.user || user;

        setFormData({
          first_name: u?.first_name || '',
          last_name: u?.last_name || '',
          phone_number: u?.phone_number || '',
          email: u?.email || '',
          username: u?.username || '',

          brand_name: b?.name || '',
          slug: b?.slug || '',
          description: b?.description || '',
          logo_url: b?.logo_url || '',

          contact_name: b?.contact_name || u?.name || '',
          contact_email: b?.contact_email || u?.email || '',
          contact_phone: b?.contact_phone || '',

          bank_name: b?.bank_name || '',
          bank_account_holder: b?.bank_account_holder || b?.name || '',
          bank_account_number: b?.bank_account_number || '',
        });
      } catch (err) {
        console.error('Failed to load profile for editing:', err);
        setErrorMsg('Failed to load existing profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await vendorApi.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        brand_name: formData.brand_name,
        description: formData.description,
        logo_url: formData.logo_url,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        bank_name: formData.bank_name,
        bank_account_holder: formData.bank_account_holder,
        bank_account_number: formData.bank_account_number,
      });

      if (refreshBrand) {
        await refreshBrand();
      }

      setSuccessMsg('Profile and brand details updated successfully!');
      setTimeout(() => {
        router.push('/vendor-portal/profile');
      }, 1200);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(
        err?.response?.data?.message ||
          'Failed to update profile. Please verify your entries.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/vendor-portal/profile"
              className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-base-content"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-semibold text-base-content/60">
              Profile Settings
            </span>
          </div>
          <h1 className="text-2xl font-bold text-base-content">
            Edit Profile & Brand Information
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Update account representative, brand identity, and bank disbursement
            coordinates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vendor-portal/profile"
            className="btn btn-outline btn-sm font-semibold"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary btn-sm text-white font-semibold gap-2 shadow-sm"
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success shadow-sm text-xs py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-error shadow-sm text-xs py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Representative */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-base-300 pb-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-sm text-base-content">
                  Account Representative
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Personal manager and access contact information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    First Name
                  </span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="e.g. John"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Last Name
                  </span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="e.g. Doe"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Username (Login)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="input input-bordered input-sm w-full bg-base-200 text-base-content/60 cursor-not-allowed pr-8"
                  />
                  <Lock className="w-3.5 h-3.5 text-base-content/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input input-bordered input-sm w-full bg-base-200 text-base-content/60 cursor-not-allowed pr-8"
                  />
                  <Lock className="w-3.5 h-3.5 text-base-content/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Mobile / Phone Number
                  </span>
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="e.g. +60 12-345 6789"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Information */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-base-300 pb-3">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-sm text-base-content">
                  Brand Identity & Presentation
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Public vendor identity displayed across products and storefront
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Brand Name
                  </span>
                </label>
                <input
                  type="text"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="Brand display name"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Brand Slug / Handle
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.slug}
                    disabled
                    className="input input-bordered input-sm w-full bg-base-200 text-base-content/60 cursor-not-allowed pr-8 font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 text-base-content/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Logo Image URL
                  </span>
                </label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="https://.../logo.png"
                />
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Brand Description
                  </span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered text-xs w-full focus:textarea-primary"
                  placeholder="Curated brand partner operating on VAMOFLEX..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Official Brand Contact */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-base-300 pb-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-sm text-base-content">
                  Official Brand Contact
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Business contact points for administrative and operational
                  notices
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Contact Person Name
                  </span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="Official PIC"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Business Email
                  </span>
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="contact@brand.com"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Business Phone
                  </span>
                </label>
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="+60 12-345 6789"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking / Payout Details */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-base-300 pb-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-sm text-base-content">
                  Payout & Banking Coordinates
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Bank accounts for weekly net settlement statements and
                  disbursements
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Bank Name
                  </span>
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="e.g. Maybank / CIMB"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Account Holder Name
                  </span>
                </label>
                <input
                  type="text"
                  name="bank_account_holder"
                  value={formData.bank_account_holder}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="Company / Owner Name"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Bank Account Number
                  </span>
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary font-mono"
                  placeholder="e.g. 512345678901"
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-base-content/60 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>
                Weekly settlement disbursements occur every Wednesday for the
                prior weekly cycle.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Save Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/vendor-portal/profile"
            className="btn btn-ghost btn-sm font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-sm text-white font-semibold gap-2 shadow-sm"
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
