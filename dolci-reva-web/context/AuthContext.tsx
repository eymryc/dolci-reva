"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import api from '@/lib/axios';
import { SingleDataApiResponse, extractApiData } from '@/types/api-response.types';
import { OWNER_SPACE_COOKIE } from '@/lib/host-paths';

export interface BusinessType {
  id: number;
  name: string;
}

export interface Wallet {
  id: number;
  balance: number;
  pending_balance?: number;
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
  email_verified?: boolean;
  admin_notes?: string | null;
  verifications?: VerificationDocument[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

function setSpaceCookie(user: User | null) {
  if (typeof document === "undefined") return;
  if (!user) {
    document.cookie = `${OWNER_SPACE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }
  const type = (user.type || "").toUpperCase();
  const role = (user.role || "").toLowerCase();
  const isAdmin =
    type === "ADMIN" ||
    type === "SUPER_ADMIN" ||
    role === "admin" ||
    role === "super_admin" ||
    role === "super-admin";
  const isOwner = type === "OWNER";
  const space = isOwner && !isAdmin ? "owner" : isAdmin ? "admin" : "";
  if (!space) {
    document.cookie = `${OWNER_SPACE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${OWNER_SPACE_COOKIE}=${space}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  /** Unique navigation après logout — ne pas appeler router.push en plus. */
  logout: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<SingleDataApiResponse<User>>('/profile');
      const userData = extractApiData<User>(res.data);
      setUser(userData || null);
      setSpaceCookie(userData || null);
    } catch {
      // Invité / session expirée : pas d'utilisateur (pas de redirect ici)
      setUser(null);
      setSpaceCookie(null);
    } finally {
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

  const logout = useCallback((redirectTo = "/auth/sign-in") => {
    void (async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        /* ignore */
      }
      localStorage.removeItem("remembered_email");
      setSpaceCookie(null);
      // Pas de setUser(null) avant la nav : évite les useEffect layouts
      // (router.push) qui courraient en parallèle du hard redirect.
      window.location.assign(redirectTo);
    })();
  }, []);

  const contextValue = useMemo(
    () => ({ user, loading, refreshUser, logout }),
    [user, loading, refreshUser, logout]
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
