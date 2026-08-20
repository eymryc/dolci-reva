import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ApiResponse, extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

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
  identity_document_type?: string | null;
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

export interface SubmitDocumentData {
  document_type: DocumentType;
  document_file: File;
  document_number?: string;
  document_issue_date?: string;
  document_expiry_date?: string;
  identity_document_type?: string;
}

// GET - Fetch all pending verifications (Admin)
export function usePendingVerifications() {
  return useQuery({
    queryKey: ["owner-verifications", "pending"],
    queryFn: async () => {
      const response = await api.get("/owner-verifications", {
        params: { status: "PENDING", per_page: 100 },
      });
      const data = extractApiData<{ data?: OwnerVerification[] } | OwnerVerification[]>(response.data);
      if (Array.isArray(data)) return data;
      return data?.data || [];
    },
  });
}

// GET - Fetch all verifications (Admin)
export function useOwnerVerifications() {
  return useQuery({
    queryKey: ["owner-verifications"],
    queryFn: async () => {
      const response = await api.get("/owner-verifications", {
        params: { per_page: 100 },
      });
      const data = extractApiData<{ data?: OwnerVerification[] } | OwnerVerification[]>(response.data);
      if (Array.isArray(data)) return data;
      return data?.data || [];
    },
  });
}

// GET - Fetch single verification (Admin)
export function useOwnerVerification(id: number) {
  return useQuery({
    queryKey: ["owner-verifications", id],
    queryFn: async () => {
      const response = await api.get(`/owner-verifications/${id}`);
      const data = extractApiData<OwnerVerification>(response.data);
      if (!data) throw new Error("Owner verification not found");
      return {
        verification: data,
        documents: [data as unknown as OwnerVerificationDocument],
      } as OwnerVerificationStatus;
    },
    enabled: !!id,
  });
}

// GET - Fetch verification status (Owner)
export function useVerificationStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: ["owner-verification", "status"],
    queryFn: async () => {
      const response = await api.get("/owner-verifications/my");
      const docs = extractApiData<OwnerVerificationDocument[]>(response.data) || [];

      const identity = docs.find((doc) => doc.document_type === "IDENTITY");
      const latest = docs[0];
      const status = (identity?.status || latest?.status || "PENDING") as VerificationStatus;

      const data: OwnerVerificationStatus = {
        verification: {
          id: identity?.id || latest?.id || 0,
          user_id: identity?.user_id || latest?.user_id || 0,
          verification_status: status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : status === "SUSPENDED" ? "SUSPENDED" : docs.length ? "UNDER_REVIEW" : "PENDING",
          verification_level: null,
          phone_verified: false,
          phone_verified_at: null,
          id_document_number: identity?.document_number || null,
          date_of_birth: null,
          address_line1: null,
          address_line2: null,
          postal_code: null,
          reputation_score: 0,
          total_bookings: 0,
          cancelled_bookings: 0,
          cancellation_rate: 0,
          is_premium: false,
          premium_until: null,
          security_deposit: null,
          has_insurance: false,
          admin_notes: identity?.notes || null,
          verified_by: identity?.reviewed_by || null,
          verified_at: identity?.reviewed_at || null,
          created_at: identity?.created_at || latest?.created_at || "",
          updated_at: identity?.updated_at || latest?.updated_at || "",
        },
        documents: docs,
      };

      return data;
    },
    enabled,
    retry: false,
  });
}

// GET - Fetch documents for a user
export function useOwnerDocuments(userId: number) {
  return useQuery({
    queryKey: ["owner-documents", userId],
    queryFn: async () => {
      const response = await api.get("/owner-verifications", {
        params: { user_id: userId, per_page: 100 },
      });
      const data = extractApiData<{ data?: OwnerVerificationDocument[] } | OwnerVerificationDocument[]>(
        response.data
      );
      if (Array.isArray(data)) return data;
      return data?.data || [];
    },
    enabled: !!userId,
  });
}

// PATCH - Review a document (approve / reject)
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
      const response =
        data.status === "APPROVED"
          ? await api.patch<ApiResponse<OwnerVerificationDocument>>(
              `/owner-verifications/${documentId}/approve`,
              { notes: data.notes }
            )
          : await api.patch<ApiResponse<OwnerVerificationDocument>>(
              `/owner-verifications/${documentId}/reject`,
              {
                rejection_reason: data.reason,
                notes: data.notes,
              }
            );

      const documentData = extractApiData<OwnerVerificationDocument>(response.data);
      if (!documentData) throw new Error("Failed to review document");
      return documentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-documents"] });
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      toast.success("Document révisé avec succès!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la révision du document" });
    },
  });
}

// PATCH - Approve a verification (identity / document)
export function useApproveOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verificationId,
      data,
    }: {
      verificationId: number;
      data: ApproveOwnerData;
    }) => {
      const response = await api.patch<ApiResponse<OwnerVerification>>(
        `/owner-verifications/${verificationId}/approve`,
        { notes: data.admin_notes }
      );
      const verificationData = extractApiData<OwnerVerification>(response.data);
      if (!verificationData) throw new Error("Failed to approve owner");
      return verificationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      toast.success("Vérification approuvée avec succès!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de l'approbation" });
    },
  });
}

// PATCH - Reject a verification
export function useRejectOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verificationId,
      data,
    }: {
      verificationId: number;
      data: RejectOwnerData;
    }) => {
      const response = await api.patch<ApiResponse<OwnerVerification>>(
        `/owner-verifications/${verificationId}/reject`,
        { rejection_reason: data.reason }
      );
      const verificationData = extractApiData<OwnerVerification>(response.data);
      if (!verificationData) throw new Error("Failed to reject owner");
      return verificationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      toast.success("Vérification rejetée.");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec du rejet" });
    },
  });
}

// PATCH - Suspend a verification
export function useSuspendOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verificationId,
    }: {
      verificationId: number;
      data?: SuspendOwnerData;
    }) => {
      const response = await api.patch<ApiResponse<OwnerVerification>>(
        `/owner-verifications/${verificationId}/suspend`
      );
      const verificationData = extractApiData<OwnerVerification>(response.data);
      if (!verificationData) throw new Error("Failed to suspend owner");
      return verificationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      toast.success("Vérification suspendue.");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suspension" });
    },
  });
}

// POST - Submit a document (Owner)
export function useSubmitDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitDocumentData) => {
      const formData = new FormData();
      formData.append("document_type", data.document_type);
      formData.append("document_file", data.document_file);
      if (data.document_number) {
        formData.append("document_number", data.document_number);
      }
      if (data.document_issue_date) {
        formData.append("document_issue_date", data.document_issue_date);
      }
      if (data.document_expiry_date) {
        formData.append("document_expiry_date", data.document_expiry_date);
      }
      if (data.identity_document_type) {
        formData.append("identity_document_type", data.identity_document_type);
      }

      const response = await api.post<ApiResponse<OwnerVerificationDocument>>("/owner-verifications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const documentData = extractApiData<OwnerVerificationDocument>(response.data);
      if (!documentData) throw new Error('Failed to submit document');
      return documentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] });
      queryClient.invalidateQueries({ queryKey: ["owner-documents"] });
      toast.success("Document soumis avec succès !");
    },
    onError: (error: unknown) => {
      // Les erreurs seront gérées par le composant qui utilise le hook
      // On utilise handleError mais sans toast pour permettre au composant de gérer les erreurs détaillées
      handleError(error, { 
        defaultMessage: "Erreur lors de la soumission du document",
        showToast: false 
      });
    },
  });
}

