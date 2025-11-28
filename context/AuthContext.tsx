"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import api from '@/lib/axios';

export interface BusinessType {
  id: number;
  name: string;
}

export interface Wallet {
  id: number;
  balance: number;
  frozen_balance?: number;
  recharge_balance?: number;
}

export interface VerificationDocument {
  id: number;
  user_id: number;
  document_type: string;
  identity_document_type?: string | null;
  document_number: string;
  document_issue_date?: string | null;
  document_expiry_date?: string | null;
  issuing_authority?: string | null;
  status: string;
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  document_file?: {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    collection_name: string;
    url: string;
    created_at: string;
  } | null;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  type: string;
  role: string;
  permissions: string[];
  businessTypes: BusinessType[];
  wallet?: Wallet | null;
  id_document_number?: string | null;
  date_of_birth?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  verification_status?: string;
  verification_level?: string;
  phone_verified?: boolean;
  phone_verified_at?: string | null;
  verified_by?: number | null;
  verified_at?: string | null;
  reputation_score?: string;
  is_premium?: boolean;
  is_verified?: boolean;
  total_bookings?: number;
  cancelled_bookings?: number;
  cancellation_rate?: string;
  has_insurance?: boolean;
  security_deposit?: number | null;
  email_verified_at?: string | null;
  admin_notes?: string | null;
  verifications?: VerificationDocument[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      try {
        const res = await api.get('/profile');
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('remembered_email');
    setUser(null);
  };

  // Écouter les changements de token dans localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (e.newValue) {
          refreshUser();
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUser]);

  // Mémoriser la valeur du contexte pour éviter les re-renders inutiles
  const contextValue = useMemo(
    () => ({ user, loading, refreshUser, logout }),
    [user, loading, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 