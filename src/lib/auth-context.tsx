'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Brand } from './types';
import { vendorApi } from './api';
import { useRouter } from 'next/navigation';

interface VendorPortalConfig {
  allow_plan_change: boolean;
}

interface AuthContextType {
  token: string | null;
  user: any | null;
  brand: Brand | null;
  roles: string[];
  permissions: string[];
  vendorConfig: VendorPortalConfig;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  login: (
    token: string,
    user: any,
    brand?: Brand,
    permissions?: string[],
    config?: VendorPortalConfig
  ) => void;
  logout: () => void;
  refreshBrand: () => Promise<void>;
  dismissSessionExpired: () => void;
  hasPermission: (permission: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [vendorConfig, setVendorConfig] = useState<VendorPortalConfig>({
    allow_plan_change: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const router = useRouter();

  const triggerSessionExpired = React.useCallback(() => {
    localStorage.removeItem("vf_vendor_token");
    localStorage.removeItem("vf_vendor_user");
    localStorage.removeItem("vf_vendor_brand");
    localStorage.removeItem("vf_vendor_permissions");
    localStorage.removeItem("vf_vendor_config");
    setToken(null);
    setUser(null);
    setBrand(null);
    setRoles([]);
    setPermissions([]);
    setIsSessionExpired(true);
  }, []);

  const dismissSessionExpired = React.useCallback(() => {
    setIsSessionExpired(false);
    router.push("/login");
  }, [router]);

  const refreshBrand = async () => {
    try {
      const data = await vendorApi.getDashboard();
      if (data.brand) {
        setBrand(data.brand);
        localStorage.setItem("vf_vendor_brand", JSON.stringify(data.brand));
      }
      if (data.permissions) {
        setPermissions(data.permissions);
        localStorage.setItem(
          "vf_vendor_permissions",
          JSON.stringify(data.permissions)
        );
      }
      if (data.roles) {
        setRoles(data.roles);
      }
      if (data.config) {
        setVendorConfig(data.config);
        localStorage.setItem(
          "vf_vendor_config",
          JSON.stringify(data.config)
        );
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        triggerSessionExpired();
      }
    }
  };

  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      triggerSessionExpired();
    };

    window.addEventListener("vf:session-expired", handleSessionExpiredEvent);
    return () =>
      window.removeEventListener(
        "vf:session-expired",
        handleSessionExpiredEvent
      );
  }, [triggerSessionExpired]);

  // Periodic Token Verification Checker
  useEffect(() => {
    if (!token) return;

    const verifyAuthToken = async () => {
      try {
        await vendorApi.verifyToken();
      } catch (err: any) {
        if (err.response?.status === 401) {
          triggerSessionExpired();
        }
      }
    };

    // Run verification immediately
    verifyAuthToken();

    // Periodic check every 45s
    const interval = setInterval(verifyAuthToken, 45000);
    return () => clearInterval(interval);
  }, [token, triggerSessionExpired]);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("vf_vendor_token");
      const savedUser = localStorage.getItem("vf_vendor_user");
      const savedBrand = localStorage.getItem("vf_vendor_brand");
      const savedPermissions = localStorage.getItem("vf_vendor_permissions");
      const savedConfig = localStorage.getItem("vf_vendor_config");

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedBrand) setBrand(JSON.parse(savedBrand));
        if (savedPermissions) setPermissions(JSON.parse(savedPermissions));
        if (savedConfig) setVendorConfig(JSON.parse(savedConfig));
        setIsLoading(false);
        refreshBrand();
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
    }
  }, []);

  const login = (
    newToken: string,
    newUser: any,
    newBrand?: Brand,
    newPermissions?: string[],
    newConfig?: VendorPortalConfig
  ) => {
    localStorage.setItem("vf_vendor_token", newToken);
    localStorage.setItem("vf_vendor_user", JSON.stringify(newUser));
    if (newBrand) {
      localStorage.setItem("vf_vendor_brand", JSON.stringify(newBrand));
      setBrand(newBrand);
    }
    if (newPermissions) {
      localStorage.setItem(
        "vf_vendor_permissions",
        JSON.stringify(newPermissions)
      );
      setPermissions(newPermissions);
    }
    if (newConfig) {
      localStorage.setItem("vf_vendor_config", JSON.stringify(newConfig));
      setVendorConfig(newConfig);
    }
    setToken(newToken);
    setUser(newUser);
    setIsSessionExpired(false);
    refreshBrand();
  };

  const logout = () => {
    localStorage.removeItem("vf_vendor_token");
    localStorage.removeItem("vf_vendor_user");
    localStorage.removeItem("vf_vendor_brand");
    localStorage.removeItem("vf_vendor_permissions");
    localStorage.removeItem("vf_vendor_config");
    setToken(null);
    setUser(null);
    setBrand(null);
    setRoles([]);
    setPermissions([]);
    setIsSessionExpired(false);
    router.push("/login");
  };

  const hasPermission = React.useCallback(
    (permission: string | string[]): boolean => {
      // Admin / Superadmin override
      if (
        roles.includes("superadmin") ||
        roles.includes("admin") ||
        roles.includes("system")
      ) {
        return true;
      }

      // Wildcard check
      if (permissions.includes("*")) {
        return true;
      }

      // If user has no permissions array yet (e.g. before initial sync), fallback to true to prevent locking out
      if (!permissions || permissions.length === 0) {
        return true;
      }

      if (Array.isArray(permission)) {
        return permission.some((p) => permissions.includes(p));
      }

      return permissions.includes(permission);
    },
    [permissions, roles]
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        brand,
        roles,
        permissions,
        vendorConfig,
        isLoading,
        isAuthenticated: !!token,
        isSessionExpired,
        login,
        logout,
        refreshBrand,
        dismissSessionExpired,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
