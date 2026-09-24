"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { vendorApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle } from "lucide-react";
import LoginPreparingModal from "@/components/LoginPreparingModal";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loggedInBrand, setLoggedInBrand] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const handoff = urlParams.get("handoff");
    const code = urlParams.get("code");
    const oauthError = urlParams.get("error");

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      return;
    }

    const processAuth = async () => {
      try {
        let response: any = null;
        if (handoff) {
          response = await vendorApi.completeGoogleHandoff(handoff);
        } else if (code) {
          response = await vendorApi.exchangeGoogleCode(code);
        } else {
          setError("Invalid sign-in response from Google.");
          return;
        }

        if (response?.needsRegistration) {
          setError("Google account requires registration before sign-in.");
          return;
        }

        const token = response.access_token || response.token || response.accessToken;
        const user = response.user || {};
        const brand = response.brand || null;

        if (!token) {
          throw new Error("Authentication succeeded but no token was returned.");
        }

        const isFirstTimeLogin = Boolean(
          user?.first_time_login ||
          user?.must_change_password ||
          response?.must_change_password
        );
        setIsFirstTime(isFirstTimeLogin);

        const userPermissions = user?.permissions || response?.permissions || [];
        login(token, user, brand, userPermissions);
        setLoggedInBrand(brand?.name || user?.brand_name || null);
        setLoggedInUser(user?.name || user?.username || null);
        setIsPreparing(true);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Google sign-in failed. Please try again.",
        );
      }
    };

    processAuth();
  }, [login]);

  return (
    <div className="w-full max-w-md py-8">
      <div className="card w-full bg-base-100/95 backdrop-blur-xl shadow-2xl border border-base-300/80 rounded-3xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="card-body p-8 items-center text-center">
          {error ? (
            <div className="space-y-4">
              <div className="alert alert-error text-sm py-3 px-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="btn btn-primary btn-sm w-full"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="py-6 space-y-4 flex flex-col items-center">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-sm text-base-content/70 font-medium">
                Authenticating with Google...
              </p>
            </div>
          )}
        </div>
      </div>

      <LoginPreparingModal
        isOpen={isPreparing}
        brandName={loggedInBrand}
        userName={loggedInUser}
        onComplete={() => {
          if (isFirstTime) {
            router.push("/first-time-setup");
          } else {
            router.push("/vendor-portal/dashboard");
          }
        }}
      />
    </div>
  );
}
