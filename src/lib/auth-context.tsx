'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Brand } from './types';
import { vendorApi } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  user: any | null;
  brand: Brand | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  login: (token: string, user: any, brand?: Brand) => void;
  logout: () => void;
  refreshBrand: () => Promise<void>;
  dismissSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const router = useRouter();

  const triggerSessionExpired = () => {
    localStorage.removeItem('vf_vendor_token');
    localStorage.removeItem('vf_vendor_user');
    localStorage.removeItem('vf_vendor_brand');
    setToken(null);
    setUser(null);
    setBrand(null);
    setIsSessionExpired(true);
  };

  const dismissSessionExpired = () => {
    setIsSessionExpired(false);
    router.push('/login');
  };

  const refreshBrand = async () => {
    try {
      const data = await vendorApi.getDashboard();
      if (data.brand) {
        setBrand(data.brand);
        localStorage.setItem('vf_vendor_brand', JSON.stringify(data.brand));
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

    window.addEventListener('vf:session-expired', handleSessionExpiredEvent);
    return () => window.removeEventListener('vf:session-expired', handleSessionExpiredEvent);
  }, []);

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
  }, [token]);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('vf_vendor_token');
      const savedUser = localStorage.getItem('vf_vendor_user');
      const savedBrand = localStorage.getItem('vf_vendor_brand');

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedBrand) setBrand(JSON.parse(savedBrand));
        setIsLoading(false);
        refreshBrand();
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: any, newBrand?: Brand) => {
    localStorage.setItem('vf_vendor_token', newToken);
    localStorage.setItem('vf_vendor_user', JSON.stringify(newUser));
    if (newBrand) {
      localStorage.setItem('vf_vendor_brand', JSON.stringify(newBrand));
      setBrand(newBrand);
    }
    setToken(newToken);
    setUser(newUser);
    setIsSessionExpired(false);
    refreshBrand();
  };

  const logout = () => {
    localStorage.removeItem('vf_vendor_token');
    localStorage.removeItem('vf_vendor_user');
    localStorage.removeItem('vf_vendor_brand');
    setToken(null);
    setUser(null);
    setBrand(null);
    setIsSessionExpired(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        brand,
        isLoading,
        isAuthenticated: !!token,
        isSessionExpired,
        login,
        logout,
        refreshBrand,
        dismissSessionExpired,
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
