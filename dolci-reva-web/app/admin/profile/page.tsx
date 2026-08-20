"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  Edit2,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  ShieldCheck,
  Upload,
  Clock,
  MapPin,
  Check,
  X,
  IdCard,
  BadgeCheck,
  Sparkles,
  Landmark,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DocumentVerificationModal } from "@/components/admin/owner-verifications/DocumentVerificationModal";
import { DocumentVerificationFormData } from "@/components/admin/owner-verifications/DocumentVerificationForm";
import { useBusinessTypes } from "@/hooks/use-business-types";
import { useVerificationStatus, DocumentType, useSubmitDocument } from "@/hooks/use-owner-verifications";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useIsHostView } from "@/hooks/use-host-view";
import { HostShell } from "@/components/admin/host/HostShell";
import { cn } from "@/lib/utils";
import { PayoutAccountForm } from "@/components/admin/payout/PayoutAccountForm";

const TYPE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OWNER: "Propriétaire",
  CUSTOMER: "Client",
};

const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  PENDING: { label: "En attente", className: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  SUBMITTED: { label: "Soumis", className: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-400" },
  UNDER_REVIEW: { label: "En révision", className: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  APPROVED: { label: "Approuvé", className: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  REJECTED: { label: "Rejeté", className: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-400" },
  SUSPENDED: { label: "Suspendu", className: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

type TabKey = "overview" | "account" | "permissions" | "verification" | "payout";

function StatusChip({ status }: { status?: string }) {
  if (!status) return null;
  const meta = STATUS_META[status] || {
    label: status,
    className: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold", meta.className)}>
      <span className={cn("h-1.5 w-1.5", meta.dot)} />
      {meta.label}
    </span>
  );
}

function TypeChip({ type }: { type: string }) {
  return (
    <span className="inline-flex border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-theme-primary">
      {TYPE_LABELS[type] || type}
    </span>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-orange-50/60 via-white to-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-gradient-to-br from-theme-primary to-theme-accent text-white shadow-md shadow-theme-primary/25">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

function FormBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-4 transition-colors hover:border-orange-100">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center bg-orange-50 text-theme-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function MetaTile({
  label,
  children,
  index = 0,
}: {
  label: string;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      whileHover={{ y: -2 }}
      className="border border-slate-100 bg-slate-50/70 p-3.5 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
    >
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="text-sm font-semibold text-slate-900">{children}</div>
    </motion.div>
  );
}

function BoolStatus({ value }: { value?: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1.5 text-emerald-600">
      <CheckCircle2 className="h-4 w-4" /> Oui
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-slate-400">
      <XCircle className="h-4 w-4" /> Non
    </span>
  );
}

function VerificationChannelCard({
  icon: Icon,
  title,
  description,
  verified,
  statusLabel,
  statusTone,
  detail,
  action,
  index = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  verified: boolean;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "neutral";
  detail?: string;
  action?: React.ReactNode;
  index?: number;
}) {
  const tone = {
    success: {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
      bar: "from-emerald-500 to-emerald-400",
      ring: "border-emerald-100",
    },
    warning: {
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      icon: "from-[#f08400] to-[#ff6b35] shadow-[#f08400]/25",
      bar: "from-[#f08400] to-[#ff6b35]",
      ring: "border-orange-100",
    },
    danger: {
      badge: "border-red-200 bg-red-50 text-red-700",
      icon: "from-red-500 to-red-600 shadow-red-500/25",
      bar: "from-red-500 to-red-400",
      ring: "border-red-100",
    },
    neutral: {
      badge: "border-slate-200 bg-slate-50 text-slate-600",
      icon: "from-slate-400 to-slate-500 shadow-slate-400/20",
      bar: "from-slate-300 to-slate-400",
      ring: "border-slate-100",
    },
  }[statusTone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={cn("relative overflow-hidden border bg-white shadow-sm", tone.ring)}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", tone.bar)} />
      <div className="flex h-full flex-col p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center bg-gradient-to-br text-white shadow-md",
                tone.icon
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
              tone.badge
            )}
          >
            {verified ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {statusLabel}
          </span>
        </div>

        {detail && (
          <p className="mb-4 border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
            {detail}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-medium text-slate-400">
            {verified ? "Validé" : "En attente de validation"}
          </span>
          {action}
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-semibold text-slate-600">
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputCls =
  "h-11 rounded-none border-slate-200 bg-white transition-all focus-visible:border-theme-primary focus-visible:ring-theme-primary/20 disabled:bg-slate-50 disabled:opacity-80";

export default function AdminProfilePage() {
  const { user } = useAuth();
  const { isAnyAdmin } = usePermissions();
  const isHostView = useIsHostView();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { data: businessTypes = [], isLoading: isLoadingBusinessTypes } = useBusinessTypes();
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<number[]>([]);
  const updateProfile = useUpdateProfile();

  const {
    data: verificationStatus,
    isLoading: isLoadingVerification,
    refetch: refetchVerification,
  } = useVerificationStatus(user?.type === "OWNER");

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [defaultDocumentType, setDefaultDocumentType] = useState<DocumentType | undefined>(undefined);
  const submitDocument = useSubmitDocument();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    id_document_number: user?.id_document_number || "",
    date_of_birth: user?.date_of_birth ? user.date_of_birth.split("T")[0] : "",
    address_line1: user?.address_line1 || "",
    address_line2: user?.address_line2 || "",
    postal_code: user?.postal_code || "",
  });

  const activeTab = useMemo<TabKey>(() => {
    const tab = searchParams.get("tab") as TabKey | null;
    const allowed: TabKey[] = ["overview", "account", "permissions", "verification", "payout"];
    if (tab && allowed.includes(tab)) {
      if (tab === "permissions" && !isAnyAdmin()) return "overview";
      if ((tab === "verification" || tab === "payout") && user?.type !== "OWNER") return "overview";
      return tab;
    }
    return "overview";
  }, [searchParams, isAnyAdmin, user?.type]);

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") params.delete("tab");
    else params.set("tab", value);
    const qs = params.toString();
    router.replace(qs ? `/admin/profile?${qs}` : "/admin/profile", { scroll: false });
  };

  useEffect(() => {
    if (!user) return;
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      id_document_number: user.id_document_number || "",
      date_of_birth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
      address_line1: user.address_line1 || "",
      address_line2: user.address_line2 || "",
      postal_code: user.postal_code || "",
    });
    setSelectedBusinessTypes(user.businessTypes?.map((bt) => bt.id) || []);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessTypeToggle = (businessTypeId: number) => {
    setSelectedBusinessTypes((prev) =>
      prev.includes(businessTypeId) ? prev.filter((id) => id !== businessTypeId) : [...prev, businessTypeId]
    );
  };

  const resetForm = () => {
    if (!user) return;
    setIsEditing(false);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      id_document_number: user.id_document_number || "",
      date_of_birth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
      address_line1: user.address_line1 || "",
      address_line2: user.address_line2 || "",
      postal_code: user.postal_code || "",
    });
    setSelectedBusinessTypes(user.businessTypes?.map((bt) => bt.id) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { ...formData, services: selectedBusinessTypes },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const openDocumentDialog = (documentType: DocumentType) => {
    setDefaultDocumentType(documentType);
    setIsDocumentModalOpen(true);
  };

  const handleDocumentSubmit = async (data: DocumentVerificationFormData): Promise<void> => {
    if (!data.document_file) throw new Error("Le fichier du document est requis");
    return new Promise((resolve, reject) => {
      submitDocument.mutate(
        {
          document_type: data.document_type,
          document_file: data.document_file as File,
          document_number: data.document_number,
          document_issue_date: data.document_issue_date,
          document_expiry_date: data.document_expiry_date,
          identity_document_type: data.identity_document_type,
        },
        {
          onSuccess: () => {
            refetchVerification();
            setIsDocumentModalOpen(false);
            setDefaultDocumentType(undefined);
            resolve();
          },
          onError: (error) => reject(error),
        }
      );
    });
  };

  if (!user) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-theme-primary" />
          <p className="text-sm font-medium text-slate-500">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const profilePicture = (user as unknown as { profile_picture?: string }).profile_picture;
  const identityDoc = verificationStatus?.documents?.find((doc) => doc.document_type === "IDENTITY");
  const initials = `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase();
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";

  const tabs: { key: TabKey; label: string; short: string; icon: React.ElementType; show: boolean; hint?: string }[] = [
    { key: "overview", label: "Profil", short: "Profil", icon: User, show: true },
    { key: "account", label: "Compte", short: "Compte", icon: Shield, show: true },
    {
      key: "permissions",
      label: "Permissions",
      short: "Perm.",
      icon: FileText,
      show: isAnyAdmin(),
      hint: user.permissions?.length ? String(user.permissions.length) : undefined,
    },
    { key: "verification", label: "Vérification", short: "Vérif.", icon: ShieldCheck, show: user.type === "OWNER" },
    { key: "payout", label: "Versement", short: "Vers.", icon: Landmark, show: user.type === "OWNER" },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  const emailVerified = Boolean(user.email_verified_at || user.email_verified);
  const identityStatus = (
    verificationStatus?.verification?.verification_status ??
    user.verification_status
  )
    ?.trim()
    .toUpperCase();
  const identityVerified = identityStatus === "APPROVED" || Boolean(user.is_verified);
  const identityMeta = identityStatus
    ? STATUS_META[identityStatus] || {
        label: identityStatus,
        className: "bg-slate-50 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
      }
    : null;

  const stats = [
    { label: "Compte", value: user.role || TYPE_LABELS[user.type] || user.type, icon: BadgeCheck },
    {
      label: "Email",
      value: emailVerified ? "Vérifié" : "Non vérifié",
      icon: Mail,
    },
    {
      label: "Pièce d'identité",
      value: identityVerified
        ? "Approuvée"
        : identityMeta?.label || "Non vérifiée",
      icon: IdCard,
    },
    { label: "Premium", value: user.is_premium ? "Actif" : "Standard", icon: Star },
  ];

  const content = (
    <div className={isHostView ? "mx-auto max-w-6xl space-y-6 pb-8" : "mx-auto max-w-5xl space-y-6 pb-8"}>
      {/* Hero asymétrique */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden border border-orange-100/70 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="h-24 bg-gradient-to-r from-theme-primary via-orange-500 to-theme-accent sm:h-28" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f08400] to-[#ffb347]"
        />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-10 h-48 w-48 bg-white/15 blur-3xl" />
          <div className="absolute left-1/3 top-4 h-24 w-24 bg-yellow-200/20 blur-2xl" />
        </div>

        <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                className="relative shrink-0"
              >
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden border-4 border-white bg-gradient-to-br from-theme-primary to-theme-accent shadow-xl shadow-theme-primary/30 sm:h-28 sm:w-28">
                  {profilePicture ? (
                    <Image src={profilePicture} alt={fullName} width={112} height={112} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{initials}</span>
                  )}
                </div>
                {user.is_verified && (
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center border-2 border-white bg-emerald-500 shadow">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </span>
                )}
                {user.is_premium && (
                  <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center border-2 border-white bg-amber-400 shadow">
                    <Star className="h-3.5 w-3.5 fill-white text-white" />
                  </span>
                )}
              </motion.div>

              <div className="min-w-0 pb-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {user.first_name} {user.last_name}
                  </h1>
                  <TypeChip type={user.type} />
                  <StatusChip status={user.verification_status} />
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-4">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-theme-primary" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-theme-primary" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={resetForm} className="h-10 rounded-none border-slate-200">
                    <X className="mr-1.5 h-4 w-4" /> Annuler
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={updateProfile.isPending}
                    onClick={() => (document.getElementById("profile-form") as HTMLFormElement | null)?.requestSubmit()}
                    className="h-10 rounded-none bg-gradient-to-r from-theme-primary to-theme-accent text-white shadow-md shadow-theme-primary/30"
                  >
                    {updateProfile.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                    Enregistrer
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setTab("overview");
                    setIsEditing(true);
                  }}
                  className="h-10 rounded-none bg-gradient-to-r from-theme-primary to-theme-accent text-white shadow-md shadow-theme-primary/30 hover:opacity-95"
                >
                  <Edit2 className="mr-1.5 h-4 w-4" /> Modifier le profil
                </Button>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                whileHover={{ y: -2 }}
                className="border border-orange-100 bg-orange-50/50 px-3 py-2.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600/80">{stat.label}</p>
                  <stat.icon className="h-3.5 w-3.5 text-theme-primary/60" />
                </div>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {user.type === "OWNER" && (!emailVerified || !identityVerified) && (
          <div className="border-t border-orange-100 bg-orange-50/60 px-5 py-3 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-theme-primary">Action requise :</span>{" "}
                {!emailVerified && !identityVerified
                  ? "confirmez votre email et déposez votre pièce d'identité."
                  : !emailVerified
                    ? "confirmez votre adresse email."
                    : "finalisez votre vérification par pièce d'identité."}
              </p>
              <button
                type="button"
                onClick={() => setTab(!emailVerified && identityVerified ? "account" : "verification")}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-theme-primary hover:underline"
              >
                {!emailVerified && identityVerified ? "Voir le statut email" : "Vérifier maintenant"}{" "}
                <ShieldCheck className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.header>

      {/* Tabs + contenu */}
      <div className="space-y-5">
        <div className="relative flex flex-wrap gap-1 border border-slate-200/80 bg-white p-1.5 shadow-sm">
          {visibleTabs.map((tab) => {
            const active = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTab(tab.key)}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:flex-none sm:px-4",
                  active ? "text-white" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="profile-tab-pill"
                    className="absolute inset-0 bg-gradient-to-r from-theme-primary to-theme-accent shadow-md shadow-theme-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <motion.span animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
                    <Icon className="h-4 w-4" />
                  </motion.span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                  {tab.hint && (
                    <span className={cn("px-1.5 py-0.5 text-[10px] font-bold", active ? "bg-white/20 text-white" : "bg-orange-50 text-theme-primary")}>
                      {tab.hint}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.28 }}
            >
              <SectionCard
                icon={User}
                title="Informations personnelles"
                description={isEditing ? "Modifiez vos informations puis enregistrez" : "Vos données de profil"}
                action={
                  isEditing ? (
                    <span className="hidden items-center gap-1.5 border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-theme-primary sm:inline-flex">
                      <Sparkles className="h-3 w-3" /> Mode édition
                    </span>
                  ) : undefined
                }
              >
                <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
                  <FormBlock title="Identité" icon={IdCard}>
                    <Field id="first_name" label="Prénom">
                      <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} disabled={!isEditing} className={inputCls} placeholder="Prénom" />
                    </Field>
                    <Field id="last_name" label="Nom">
                      <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} disabled={!isEditing} className={inputCls} placeholder="Nom" />
                    </Field>
                    <Field id="id_document_number" label="N° pièce d'identité">
                      <Input id="id_document_number" name="id_document_number" value={formData.id_document_number} onChange={handleInputChange} disabled={!isEditing} className={inputCls} placeholder="CI123456789" />
                    </Field>
                    <Field
                      id="date_of_birth"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-theme-primary" /> Date de naissance
                        </span>
                      }
                    >
                      <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} disabled={!isEditing} className={inputCls} />
                    </Field>
                  </FormBlock>

                  <FormBlock title="Coordonnées" icon={Mail}>
                    <Field
                      id="email"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-theme-primary" /> Email
                        </span>
                      }
                    >
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className={inputCls} placeholder="email@exemple.com" />
                    </Field>
                    <Field
                      id="phone"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-theme-primary" /> Téléphone
                        </span>
                      }
                    >
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className={inputCls} placeholder="+225 ..." />
                    </Field>
                  </FormBlock>

                  <FormBlock title="Adresse" icon={MapPin}>
                    <Field
                      id="address_line1"
                      className="sm:col-span-2"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-theme-primary" /> Adresse
                        </span>
                      }
                    >
                      <Input id="address_line1" name="address_line1" value={formData.address_line1} onChange={handleInputChange} disabled={!isEditing} className={inputCls} placeholder="Rue, quartier..." />
                    </Field>
                    <Field id="address_line2" className="sm:col-span-2" label="Complément d'adresse">
                      <Textarea
                        id="address_line2"
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={2}
                        className="resize-none rounded-none border-slate-200 bg-white disabled:bg-slate-50 disabled:opacity-80"
                        placeholder="Appartement, résidence..."
                      />
                    </Field>
                  </FormBlock>

                  {user.type === "OWNER" && (
                    <div className="border border-orange-100 bg-gradient-to-br from-orange-50/40 to-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center bg-orange-100 text-theme-primary">
                            <BadgeCheck className="h-3.5 w-3.5" />
                          </span>
                          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Types de services</h3>
                        </div>
                        {selectedBusinessTypes.length > 0 && (
                          <span className="bg-theme-primary/10 px-2 py-0.5 text-[10px] font-bold text-theme-primary">
                            {selectedBusinessTypes.length} sélectionné{selectedBusinessTypes.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {isLoadingBusinessTypes ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin text-theme-primary" /> Chargement...
                        </div>
                      ) : businessTypes.length === 0 ? (
                        <p className="py-4 text-center text-sm text-slate-500">Aucun type de service disponible</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {businessTypes.map((businessType) => {
                            const isSelected = selectedBusinessTypes.includes(businessType.id);
                            return (
                              <motion.button
                                key={businessType.id}
                                type="button"
                                disabled={!isEditing}
                                whileTap={isEditing ? { scale: 0.97 } : undefined}
                                onClick={() => handleBusinessTypeToggle(businessType.id)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-all",
                                  isSelected
                                    ? "border-theme-primary bg-gradient-to-r from-theme-primary/10 to-theme-accent/10 text-theme-primary"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/50",
                                  !isEditing && "cursor-default opacity-70"
                                )}
                              >
                                {isSelected && (
                                  <span className="flex h-4 w-4 items-center justify-center bg-theme-primary text-white">
                                    <Check className="h-2.5 w-2.5" />
                                  </span>
                                )}
                                {businessType.name}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                          <Button type="button" variant="outline" onClick={resetForm} className="h-11 rounded-none">
                            Annuler
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateProfile.isPending}
                            className="h-11 rounded-none bg-gradient-to-r from-theme-primary to-theme-accent text-white shadow-md shadow-theme-primary/25"
                          >
                            {updateProfile.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </SectionCard>
            </motion.div>
          )}

          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.28 }}
              className="space-y-5"
            >
              <SectionCard
                icon={ShieldCheck}
                title="Vérifications du compte"
                description="Deux étapes distinctes : email et pièce d'identité"
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <VerificationChannelCard
                    index={0}
                    icon={Mail}
                    title="Vérification par email"
                    description="Confirmez que votre adresse email vous appartient."
                    verified={emailVerified}
                    statusLabel={emailVerified ? "Vérifié" : "Non vérifié"}
                    statusTone={emailVerified ? "success" : "warning"}
                    detail={
                      emailVerified && user.email_verified_at
                        ? `Confirmé le ${new Date(user.email_verified_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })} · ${user.email}`
                        : `Un lien de confirmation a été envoyé à ${user.email}`
                    }
                    action={
                      !emailVerified ? (
                        <span className="text-[11px] font-semibold text-theme-primary">
                          Consultez votre boîte mail
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Email confirmé
                        </span>
                      )
                    }
                  />

                  <VerificationChannelCard
                    index={1}
                    icon={IdCard}
                    title="Vérification par pièce d'identité"
                    description="Soumettez une pièce officielle pour valider votre identité."
                    verified={identityVerified}
                    statusLabel={
                      identityVerified
                        ? "Approuvée"
                        : identityMeta?.label || "Non vérifiée"
                    }
                    statusTone={
                      identityVerified
                        ? "success"
                        : identityStatus === "REJECTED" || identityStatus === "SUSPENDED"
                          ? "danger"
                          : identityStatus === "UNDER_REVIEW" || identityStatus === "SUBMITTED"
                            ? "neutral"
                            : "warning"
                    }
                    detail={
                      identityVerified
                        ? user.verified_at
                          ? `Approuvée le ${new Date(user.verified_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : "Votre identité a été validée par l'équipe Dolci Rêva."
                        : user.type === "OWNER"
                          ? "Requise pour publier vos établissements et recevoir des réservations."
                          : "Confirme votre identité auprès de la plateforme."
                    }
                    action={
                      user.type === "OWNER" && !identityVerified ? (
                        <button
                          type="button"
                          onClick={() => setTab("verification")}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-theme-primary to-theme-accent px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-opacity hover:opacity-95"
                        >
                          Déposer ma pièce
                          <Upload className="h-3 w-3" />
                        </button>
                      ) : identityVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Identité validée
                        </span>
                      ) : null
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard
                icon={Shield}
                title="Informations de compte"
                description="Type, statut premium et coordonnées liées"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <MetaTile label="Type de compte" index={0}>
                    <TypeChip type={user.type} />
                  </MetaTile>
                  <MetaTile label="Rôle" index={1}>
                    <span>{user.role || TYPE_LABELS[user.type] || "—"}</span>
                  </MetaTile>
                  <MetaTile label="Premium" index={2}>
                    {user.is_premium ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-600">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Star className="h-4 w-4" /> Standard
                      </span>
                    )}
                  </MetaTile>
                  <MetaTile label="Téléphone" index={3}>
                    <div className="flex flex-col gap-1">
                      <span className="truncate">{user.phone || "—"}</span>
                      <BoolStatus value={user.phone_verified} />
                    </div>
                  </MetaTile>
                  <MetaTile label="Email" index={4}>
                    <div className="flex flex-col gap-1">
                      <span className="truncate">{user.email}</span>
                      <BoolStatus value={emailVerified} />
                    </div>
                  </MetaTile>
                  {user.type === "OWNER" && (
                    <MetaTile label="Niveau d'identité" index={5}>
                      <span>
                        {verificationStatus?.verification?.verification_level ||
                          user.verification_level ||
                          "—"}
                      </span>
                    </MetaTile>
                  )}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {activeTab === "permissions" && isAnyAdmin() && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.28 }}
            >
              {user.permissions && user.permissions.length > 0 ? (
                <SectionCard
                  icon={FileText}
                  title="Permissions"
                  description={`${user.permissions.length} permission${user.permissions.length > 1 ? "s" : ""} accordée${user.permissions.length > 1 ? "s" : ""}`}
                >
                  <div className="grid max-h-[480px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {user.permissions.map((permission, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.35) }}
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2 border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-orange-100 hover:bg-orange-50/40"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-theme-primary" />
                        <span className="truncate font-mono">{permission}</span>
                      </motion.div>
                    ))}
                  </div>
                </SectionCard>
              ) : (
                <div className="border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                  <h3 className="text-base font-bold text-slate-900">Aucune permission</h3>
                  <p className="mt-1 text-sm text-slate-500">Vous n&apos;avez aucune permission assignée.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "verification" && user.type === "OWNER" && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.28 }}
              className="space-y-5"
            >
              {isLoadingVerification ? (
                <div className="flex items-center justify-center gap-3 border border-slate-200 bg-white py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-theme-primary" />
                  <span className="text-sm text-slate-500">Chargement de la vérification...</span>
                </div>
              ) : (
                <>
                  <SectionCard
                    icon={ShieldCheck}
                    title="Vérification d'identité"
                    description="Deux étapes pour activer la publication de vos établissements"
                  >
                    {/* Stepper */}
                    <div className="mb-6">
                      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="absolute left-[25%] right-[25%] top-7 hidden h-0.5 bg-slate-100 sm:block">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              emailVerified
                                ? "w-full bg-gradient-to-r from-emerald-400 to-[#f08400]"
                                : "w-0"
                            )}
                          />
                        </div>

                        {/* Email step */}
                        <div
                          className={cn(
                            "relative z-10 border bg-white p-4 shadow-sm",
                            emailVerified ? "border-emerald-200" : "border-amber-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center text-white shadow-md",
                                emailVerified
                                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25"
                                  : "bg-gradient-to-br from-[#f08400] to-[#ff6b35] shadow-[#f08400]/25"
                              )}
                            >
                              {emailVerified ? <CheckCircle2 className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                  01 · Email
                                </span>
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                                    emailVerified
                                      ? "bg-emerald-500 text-white"
                                      : "bg-amber-500 text-white"
                                  )}
                                >
                                  {emailVerified ? "Validé" : "En attente"}
                                </span>
                              </div>
                              <p className="truncate text-sm font-bold text-slate-900">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Identity step */}
                        <div
                          className={cn(
                            "relative z-10 border bg-white p-4 shadow-sm",
                            identityDoc?.status === "APPROVED"
                              ? "border-emerald-200"
                              : identityDoc?.status === "REJECTED"
                                ? "border-red-200"
                                : identityDoc
                                  ? "border-[#f08400]/40"
                                  : "border-slate-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center text-white shadow-md",
                                identityDoc?.status === "APPROVED"
                                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25"
                                  : identityDoc?.status === "REJECTED"
                                    ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25"
                                    : "bg-gradient-to-br from-[#f08400] to-[#ff6b35] shadow-[#f08400]/25"
                              )}
                            >
                              {identityDoc?.status === "APPROVED" ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <IdCard className="h-5 w-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                  02 · Identité
                                </span>
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white",
                                    identityDoc?.status === "APPROVED"
                                      ? "bg-emerald-500"
                                      : identityDoc?.status === "REJECTED"
                                        ? "bg-red-500"
                                        : identityDoc
                                          ? "bg-[#f08400]"
                                          : "bg-slate-400"
                                  )}
                                >
                                  {identityDoc?.status === "APPROVED"
                                    ? "Approuvée"
                                    : identityDoc?.status === "REJECTED"
                                      ? "Rejetée"
                                      : identityDoc
                                        ? "En revue"
                                        : "À faire"}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-slate-900">Pièce d&apos;identité</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document status panel */}
                    <div
                      className={cn(
                        "relative overflow-hidden border",
                        identityDoc?.status === "APPROVED"
                          ? "border-emerald-200"
                          : identityDoc?.status === "REJECTED"
                            ? "border-red-200"
                            : identityDoc
                              ? "border-[#f08400]/35"
                              : "border-dashed border-slate-200"
                      )}
                    >
                      {/* Top accent */}
                      <div
                        className={cn(
                          "h-1.5 w-full",
                          identityDoc?.status === "APPROVED"
                            ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                            : identityDoc?.status === "REJECTED"
                              ? "bg-gradient-to-r from-red-400 to-red-600"
                              : identityDoc
                                ? "bg-gradient-to-r from-[#f08400] via-[#ff6b35] to-[#f08400]"
                                : "bg-slate-200"
                        )}
                      />

                      <div
                        className={cn(
                          "p-5 sm:p-6",
                          identityDoc?.status === "APPROVED"
                            ? "bg-gradient-to-br from-emerald-50/60 via-white to-white"
                            : identityDoc?.status === "REJECTED"
                              ? "bg-gradient-to-br from-red-50/60 via-white to-white"
                              : identityDoc
                                ? "bg-gradient-to-br from-orange-50/80 via-white to-amber-50/30"
                                : "bg-slate-50/40"
                        )}
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="relative shrink-0">
                              {identityDoc && identityDoc.status !== "APPROVED" && identityDoc.status !== "REJECTED" && (
                                <span className="absolute -inset-1 animate-ping bg-[#f08400]/20" />
                              )}
                              <div
                                className={cn(
                                  "relative flex h-14 w-14 items-center justify-center text-white shadow-lg",
                                  identityDoc?.status === "APPROVED"
                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30"
                                    : identityDoc?.status === "REJECTED"
                                      ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30"
                                      : "bg-gradient-to-br from-[#f08400] to-[#ff6b35] shadow-[#f08400]/30"
                                )}
                              >
                                <IdCard className="h-6 w-6" />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                  Pièce d&apos;identité
                                </h3>
                                {!identityDoc ? (
                                  <span className="inline-flex items-center gap-1 border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                    Non soumise
                                  </span>
                                ) : identityDoc.status === "APPROVED" ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                    <Check className="h-3 w-3" /> Approuvée
                                  </span>
                                ) : identityDoc.status === "REJECTED" ? (
                                  <span className="inline-flex items-center gap-1 bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                    <X className="h-3 w-3" /> Rejetée
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 bg-[#f08400] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                                    </span>
                                    En examen
                                  </span>
                                )}
                              </div>

                              <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                                {!identityDoc
                                  ? "Déposez une pièce officielle (CNI, passeport ou titre de séjour) pour que notre équipe valide votre identité."
                                  : identityDoc.status === "APPROVED"
                                    ? "Identité validée. Vous pouvez désormais publier et gérer vos établissements."
                                    : identityDoc.status === "REJECTED"
                                      ? identityDoc.rejection_reason ||
                                        "Le document a été refusé. Vérifiez la lisibilité et resoumettez une pièce valide."
                                      : "Dossier reçu. Un agent Dolci Rêva vérifie actuellement votre document — vous serez notifié dès validation."}
                              </p>
                            </div>
                          </div>

                          {(!identityDoc || identityDoc.status === "REJECTED") && (
                            <Button
                              onClick={() => openDocumentDialog("IDENTITY")}
                              className="h-11 shrink-0 rounded-none bg-gradient-to-r from-theme-primary to-theme-accent px-5 font-bold text-white shadow-md shadow-theme-primary/25"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {identityDoc?.status === "REJECTED" ? "Resoumettre" : "Déposer ma pièce"}
                            </Button>
                          )}
                        </div>

                        {/* Meta details when submitted */}
                        {identityDoc && (
                          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-4">
                            {[
                              {
                                label: "Statut",
                                value:
                                  identityDoc.status === "APPROVED"
                                    ? "Approuvée"
                                    : identityDoc.status === "REJECTED"
                                      ? "Rejetée"
                                      : "En attente",
                              },
                              {
                                label: "N° document",
                                value: identityDoc.document_number || "—",
                              },
                              {
                                label: "Type",
                                value:
                                  identityDoc.identity_document_type === "CNI"
                                    ? "CNI"
                                    : identityDoc.identity_document_type === "PASSPORT"
                                      ? "Passeport"
                                      : identityDoc.identity_document_type === "SEJOUR"
                                        ? "Séjour"
                                        : identityDoc.identity_document_type || "Pièce d'identité",
                              },
                              {
                                label: "Soumis le",
                                value: identityDoc.created_at
                                  ? new Date(identityDoc.created_at).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—",
                              },
                            ].map((item) => (
                              <div key={item.label} className="bg-white px-3 py-3 sm:px-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                  {item.label}
                                </p>
                                <p className="mt-1 truncate text-sm font-bold text-slate-800">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pending timeline */}
                        {identityDoc && identityDoc.status !== "APPROVED" && identityDoc.status !== "REJECTED" && (
                          <div className="mt-5 border border-orange-100 bg-white/80 p-4">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f08400]">
                              Suivi du dossier
                            </p>
                            <div className="space-y-3">
                              {[
                                { done: true, label: "Document reçu", detail: "Votre fichier a bien été enregistré" },
                                { done: true, label: "En file d'examen", detail: "Assigné à l'équipe de vérification" },
                                { done: false, label: "Décision finale", detail: "Validation ou demande de resoumission" },
                              ].map((step, i) => (
                                <div key={step.label} className="flex items-start gap-3">
                                  <div className="relative flex flex-col items-center">
                                    <div
                                      className={cn(
                                        "flex h-6 w-6 items-center justify-center",
                                        step.done
                                          ? "bg-[#f08400] text-white"
                                          : "border-2 border-dashed border-slate-300 bg-white text-slate-300"
                                      )}
                                    >
                                      {step.done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                    </div>
                                    {i < 2 && (
                                      <div className={cn("mt-1 h-4 w-0.5", step.done ? "bg-[#f08400]/40" : "bg-slate-200")} />
                                    )}
                                  </div>
                                  <div className="min-w-0 pb-1">
                                    <p className={cn("text-sm font-bold", step.done ? "text-slate-900" : "text-slate-400")}>
                                      {step.label}
                                    </p>
                                    <p className="text-xs text-slate-500">{step.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="mt-3 border-t border-orange-50 pt-3 text-xs text-slate-500">
                              Délai moyen de traitement : <span className="font-semibold text-slate-700">24 à 48 h ouvrées</span>
                            </p>
                          </div>
                        )}

                        {/* Empty state tips */}
                        {!identityDoc && (
                          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {[
                              { icon: FileText, title: "Formats", text: "JPG, PNG ou PDF" },
                              { icon: Upload, title: "Taille max", text: "10 Mo" },
                              { icon: Clock, title: "Délai", text: "24–48 h" },
                            ].map((tip) => (
                              <div
                                key={tip.title}
                                className="flex items-center gap-3 border border-slate-100 bg-white px-3 py-2.5"
                              >
                                <tip.icon className="h-4 w-4 shrink-0 text-[#f08400]" />
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    {tip.title}
                                  </p>
                                  <p className="text-xs font-semibold text-slate-700">{tip.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {verificationStatus?.verification?.admin_notes && (
                      <div className="mt-4 border border-orange-100 bg-orange-50/50 p-4">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-orange-600">
                          Notes administrateur
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">
                          {verificationStatus.verification.admin_notes}
                        </p>
                      </div>
                    )}
                  </SectionCard>
                </>
              )}

              <DocumentVerificationModal
                open={isDocumentModalOpen}
                onOpenChange={setIsDocumentModalOpen}
                onSubmit={handleDocumentSubmit}
                defaultDocumentType={defaultDocumentType}
                isLoading={submitDocument.isPending}
              />
            </motion.div>
          )}

          {activeTab === "payout" && user.type === "OWNER" && (
            <motion.div
              key="payout"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.28 }}
              className="space-y-5"
            >
              <SectionCard
                icon={Landmark}
                title="Compte de versement"
                description="Où recevoir vos gains après retrait (Wave, Orange Money, banque…)"
              >
                <PayoutAccountForm />
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isHostView) {
    return <HostShell>{content}</HostShell>;
  }
  return content;
}
