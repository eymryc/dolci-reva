import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

// Types
export type VerificationStatus = 
  | "PENDING" 
  | "SUBMITTED" 
  | "UNDER_REVIEW" 
  | "APPROVED" 
  | "REJECTED" 
  | "SUSPENDED";

export type VerificationLevel = 
  | "BRONZE" 
  | "SILVER" 
  | "GOLD" 
  | "PREMIUM";

export type DocumentType = 
  | "IDENTITY" 
  | "ADDRESS_PROOF" 
  | "PROPERTY_TITLE" 
  | "BANK_STATEMENT" 
  | "INSURANCE";

export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface OwnerVerification {
  id: number;
  user_id: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  verification_status: VerificationStatus;
  verification_level: VerificationLevel | null;
  phone_verified: boolean;
  phone_verified_at: string | null;
  id_document_number: string | null;
  date_of_birth: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  reputation_score: number;
  total_bookings: number;
  cancelled_bookings: number;
  cancellation_rate: number;
  is_premium: boolean;
  premium_until: string | null;
  security_deposit: number | null;
  has_insurance: boolean;
  admin_notes: string | null;
  verified_by: number | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerVerificationDocument {
  id: number;
  user_id: number;
  document_type: DocumentType;
  document_number: string;
  document_issue_date: string | null;
  document_expiry_date: string | null;
  issuing_authority: string | null;
  status: DocumentStatus;
  rejection_reason: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  notes: string | null;
  document_file_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerVerificationStatus {
  verification: OwnerVerification;
  documents: OwnerVerificationDocument[];
}

export interface ReviewDocumentData {
  status: "APPROVED" | "REJECTED";
  reason?: string;
  notes?: string;
}

export interface ApproveOwnerData {
  admin_notes?: string;
}

export interface RejectOwnerData {
  reason: string;
}

export interface SuspendOwnerData {
  reason: string;
}

// GET - Fetch all pending verifications (Admin)
export function usePendingVerifications() {
  return useQuery({
    queryKey: ["owner-verifications", "pending"],
    queryFn: async () => {
      const response = await api.get("/owner-verification/pending");
      return response.data.data as OwnerVerification[];
    },
  });
}

// GET - Fetch all verifications (Admin)
export function useOwnerVerifications() {
  return useQuery({
    queryKey: ["owner-verifications"],
    queryFn: async () => {
      const response = await api.get("/owner-verification");
      return response.data.data as OwnerVerification[];
    },
  });
}

// GET - Fetch single verification (Admin)
export function useOwnerVerification(id: number) {
  return useQuery({
    queryKey: ["owner-verifications", id],
    queryFn: async () => {
      const response = await api.get(`/owner-verification/${id}`);
      return response.data.data as OwnerVerificationStatus;
    },
    enabled: !!id,
  });
}

// GET - Fetch verification status (Owner)
export function useVerificationStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: ["owner-verification", "status"],
    queryFn: async () => {
      const response = await api.get("/owner-verification/status");
      return response.data.data as OwnerVerificationStatus;
    },
    enabled,
  });
}

// GET - Fetch documents for a user
export function useOwnerDocuments(userId: number) {
  return useQuery({
    queryKey: ["owner-documents", userId],
    queryFn: async () => {
      const response = await api.get(`/owner-verification/documents/${userId}`);
      return response.data.data as OwnerVerificationDocument[];
    },
    enabled: !!userId,
  });
}

// POST - Review a document
export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      data,
    }: {
      documentId: number;
      data: ReviewDocumentData;
    }) => {
      const response = await api.post(
        `/owner-verification/documents/${documentId}/review`,
        data
      );
      return response.data.data as OwnerVerificationDocument;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-documents"] });
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      toast.success("Document révisé avec succès!");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Échec de la révision du document"
      );
    },
  });
}

// POST - Approve owner
export function useApproveOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ownerId,
      data,
    }: {
      ownerId: number;
      data: ApproveOwnerData;
    }) => {
      const response = await api.post(
        `/owner-verification/owners/${ownerId}/approve`,
        data
      );
      return response.data.data as OwnerVerification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      toast.success("Propriétaire approuvé avec succès!");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Échec de l'approbation du propriétaire"
      );
    },
  });
}

// POST - Reject owner
export function useRejectOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ownerId,
      data,
    }: {
      ownerId: number;
      data: RejectOwnerData;
    }) => {
      const response = await api.post(
        `/owner-verification/owners/${ownerId}/reject`,
        data
      );
      return response.data.data as OwnerVerification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      toast.success("Propriétaire rejeté.");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Échec du rejet du propriétaire"
      );
    },
  });
}

// POST - Suspend owner
export function useSuspendOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ownerId,
      data,
    }: {
      ownerId: number;
      data: SuspendOwnerData;
    }) => {
      const response = await api.post(
        `/owner-verification/owners/${ownerId}/suspend`,
        data
      );
      return response.data.data as OwnerVerification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      toast.success("Propriétaire suspendu.");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Échec de la suspension du propriétaire"
      );
    },
  });
}

