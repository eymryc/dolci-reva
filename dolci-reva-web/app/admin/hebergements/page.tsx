"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  Home,
  Loader2,
} from "lucide-react";
import { AddButton } from "@/components/admin/shared/AddButton";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/context/AuthContext";
import {
  useDwellings,
  useDeleteDwelling,
  type Dwelling,
} from "@/hooks/use-dwellings";
import {
  useVisits,
} from "@/hooks/use-visits";
import { DwellingTable } from "@/components/admin/hebergements/DwellingTable";
import { VisitTable } from "@/components/admin/hebergements/VisitTable";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { HostPageHeader } from "@/components/admin/host/HostPageHeader";
import { OwnerEstablishmentGallery } from "@/components/admin/host/OwnerEstablishmentGallery";
import { HostShell } from "@/components/admin/host/HostShell";
import type { EstablishmentCardData } from "@/components/admin/host/EstablishmentCard";
import { useBackofficePath } from "@/hooks/use-host-view";

function formatRent(rent: string | number | null | undefined) {
  if (rent == null || rent === "") return undefined;
  const n = Number(rent);
  if (Number.isNaN(n)) return undefined;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

function toDwellingCard(
  dwelling: Dwelling,
  path: (p: string) => string
): EstablishmentCardData {
  return {
    id: dwelling.id,
    name: dwelling.type
      ? `${dwelling.type} · ${dwelling.city}`
      : dwelling.address || `Hébergement #${dwelling.id}`,
    href: path(`/hebergements/${dwelling.id}`),
    imageUrl: dwelling.main_image_url || dwelling.main_image_thumb_url,
    location: [dwelling.address, dwelling.city, dwelling.country]
      .filter(Boolean)
      .join(", "),
    priceLabel: formatRent(dwelling.rent),
    status: dwelling.is_active ? "available" : "inactive",
    statusLabel: dwelling.is_active ? "Actif" : "Inactif",
  };
}

export default function HebergementsPage() {
  const bo = useBackofficePath();
  const router = useRouter();
  const { isOwner, isAnyAdmin } = usePermissions();
  const { user } = useAuth();
  const isHostView = isOwner() && !isAnyAdmin();

  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  const isOwnerApproved = isOwner() ? isOwnerVerified : true;

  const [search, setSearch] = useState("");

  // Dwellings - TanStack Query
  const { 
    data: dwellings = [], 
    isLoading: isLoadingDwellings,
    refetch: refetchDwellings,
    isRefetching: isRefetchingDwellings,
  } = useDwellings();
  const deleteDwellingMutation = useDeleteDwelling();

  // Visits - TanStack Query
  const [visitsPage] = useState(1);
  const { 
    data: visitsData,
    isLoading: isLoadingVisits,
    refetch: refetchVisits,
    isRefetching: isRefetchingVisits,
  } = useVisits(visitsPage);
  const visits = visitsData?.data || [];

  // Dwellings State
  const [isDwellingDeleteDialogOpen, setIsDwellingDeleteDialogOpen] = useState(false);
  const [dwellingToDelete, setDwellingToDelete] = useState<Dwelling | null>(null);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dwellings
      .filter((d) => {
        if (!q) return true;
        return (
          d.type?.toLowerCase().includes(q) ||
          d.city?.toLowerCase().includes(q) ||
          d.address?.toLowerCase().includes(q) ||
          d.country?.toLowerCase().includes(q)
        );
      })
      .map((d) => toDwellingCard(d, bo));
  }, [dwellings, search, bo]);

  // Dwelling Handlers
  const handleCreateDwelling = () => {
    router.push(bo("/hebergements/new"));
  };

  const handleEditDwelling = (dwelling: Dwelling) => {
    router.push(bo(`/hebergements/${dwelling.id}/edit`));
  };

  const handleDeleteDwelling = (dwelling: Dwelling) => {
    setDwellingToDelete(dwelling);
    setIsDwellingDeleteDialogOpen(true);
  };

  const handleConfirmDwellingDelete = () => {
    if (dwellingToDelete) {
      deleteDwellingMutation.mutate(dwellingToDelete.id, {
        onSuccess: () => {
          setIsDwellingDeleteDialogOpen(false);
          setDwellingToDelete(null);
        },
      });
    }
  };

  if (isHostView) {
    return (
      <HostShell>
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <HostPageHeader
            eyebrow="Espace hôte"
            title="Hébergements"
            description="Logements longue durée et demandes de visite."
            count={filteredCards.length}
            countLabel={{ singular: "hébergement", plural: "hébergements" }}
            actionLabel="Ajouter un hébergement"
            onAction={handleCreateDwelling}
            actionDisabled={isLoadingDwellings || !isOwnerApproved}
            actionTitle={
              !isOwnerApproved
                ? "Votre compte doit être vérifié pour ajouter un hébergement"
                : undefined
            }
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rechercher un hébergement…"
          />

          <Tabs defaultValue="hebergements" className="w-full">
            <div className="relative mb-6 pb-4">
              <TabsList className="inline-flex h-auto gap-0 bg-transparent p-0">
                <TabsTrigger
                  value="hebergements"
                  className="relative flex items-center justify-center rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:!border-[#f08400] data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400]"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Hébergements
                </TabsTrigger>
                <TabsTrigger
                  value="visits"
                  className="relative flex items-center justify-center rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:!border-[#f08400] data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400]"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Visites
                </TabsTrigger>
              </TabsList>
              <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300" />
            </div>

            <TabsContent value="hebergements" className="mt-0">
              <OwnerEstablishmentGallery
                items={filteredCards}
                isLoading={isLoadingDwellings}
                emptyTitle="Votre premier hébergement vous attend"
                emptyDescription="Ajoutez un logement pour commencer à recevoir des demandes sur Dolci Rêva."
                onEdit={(id) => router.push(bo(`/hebergements/${id}/edit`))}
                onDelete={(id) => {
                  const d = dwellings.find((x) => x.id === id);
                  if (d) handleDeleteDwelling(d);
                }}
              />
            </TabsContent>

            <TabsContent value="visits" className="mt-0 space-y-4">
              {isLoadingVisits ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#f08400]" />
                  <p className="text-sm text-slate-500">Chargement des visites…</p>
                </div>
              ) : (
                <VisitTable
                  data={visits}
                  isLoading={isLoadingVisits}
                  onRefresh={() => refetchVisits()}
                  isRefreshing={isRefetchingVisits}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        <DeleteConfirmationDialog
          open={isDwellingDeleteDialogOpen}
          onOpenChange={setIsDwellingDeleteDialogOpen}
          onConfirm={handleConfirmDwellingDelete}
          title="Supprimer l'hébergement"
          description="Êtes-vous sûr de vouloir supprimer cet hébergement ? Cette action ne peut pas être annulée."
          itemName={
            dwellingToDelete
              ? dwellingToDelete.type
                ? `${dwellingToDelete.type} · ${dwellingToDelete.city}`
                : dwellingToDelete.address
              : undefined
          }
          isLoading={deleteDwellingMutation.isPending}
        />
      </HostShell>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <Tabs defaultValue="visits" className="w-full">
          <div className="relative mb-6 pb-4">
            <TabsList className="inline-flex h-auto bg-transparent p-0 gap-0">
              <TabsTrigger
                value="visits"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Visites
              </TabsTrigger>
              <TabsTrigger
                value="hebergements"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Home className="w-4 h-4 mr-2" />
                Hébergement
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300"></div>
          </div>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-6">
            {/* Visits Table */}
            {isLoadingVisits ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des visites...</p>
              </div>
            ) : (
              <VisitTable
                data={visits}
                isLoading={isLoadingVisits}
                onRefresh={() => refetchVisits()}
                isRefreshing={isRefetchingVisits}
              />
            )}
          </TabsContent>

          {/* Hébergements Tab */}
          <TabsContent value="hebergements" className="space-y-6">
        {/* Hébergement Table */}
        {isLoadingDwellings ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
            <p className="text-gray-500 text-sm">Chargement des hébergements...</p>
          </div>
        ) : (
          <DwellingTable
            data={dwellings}
            onEdit={handleEditDwelling}
            onDelete={handleDeleteDwelling}
            isLoading={deleteDwellingMutation.isPending}
            onRefresh={() => refetchDwellings()}
            isRefreshing={isRefetchingDwellings}
            addButton={
              <AddButton
                onClick={handleCreateDwelling}
                label="Ajouter un hébergement"
                isLoading={isLoadingDwellings}
                disabled={isLoadingDwellings || (isOwner() && !isOwnerApproved)}
                title={isOwner() && !isOwnerApproved ? "Votre compte doit être vérifié pour ajouter un hébergement" : undefined}
              />
            }
          />
        )}

            {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDwellingDeleteDialogOpen}
        onOpenChange={setIsDwellingDeleteDialogOpen}
        onConfirm={handleConfirmDwellingDelete}
        title="Supprimer l'hébergement"
        description="Êtes-vous sûr de vouloir supprimer cet hébergement ? Cette action ne peut pas être annulée."
        itemName={dwellingToDelete?.description || `Hébergement #${dwellingToDelete?.id}`}
        isLoading={deleteDwellingMutation.isPending}
      />
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
