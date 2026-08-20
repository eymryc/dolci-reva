"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import { Music2, Loader2 } from "lucide-react";
import { AddButton } from "@/components/admin/shared/AddButton";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { NightClubTable } from "@/components/admin/night-clubs/NightClubTable";
import { HostPageHeader } from "@/components/admin/host/HostPageHeader";
import { OwnerEstablishmentGallery } from "@/components/admin/host/OwnerEstablishmentGallery";
import { HostShell } from "@/components/admin/host/HostShell";
import { useBackofficePath } from "@/hooks/use-host-view";
import { useIsHostView } from "@/hooks/use-host-view";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import type { NightlifeVenue } from "@/types/entities/nightlife-venue.types";

function useAdminNightClubs() {
  return useQuery({
    queryKey: ["admin", "night-clubs"],
    queryFn: async () => {
      const response = await api.get("/night-clubs");
      const data = extractApiData<NightlifeVenue[]>(response.data);
      return data || [];
    },
  });
}

function useDeleteNightClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/night-clubs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "night-clubs"] });
      toast.success("Night-club supprimé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Erreur lors de la suppression du night-club" });
    },
  });
}

export default function NightClubsAdminPage() {
  const bo = useBackofficePath();
  const router = useRouter();
  const isHostView = useIsHostView();
  const { data: nightClubs = [], isLoading, isRefetching, refetch } = useAdminNightClubs();
  const deleteMutation = useDeleteNightClub();
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<NightlifeVenue | null>(null);

  const handleCreate = () => router.push(bo("/night-clubs/new"));
  const handleEdit = (club: NightlifeVenue) =>
    router.push(bo(`/night-clubs/${club.id}/edit`));
  const handleDelete = (club: NightlifeVenue) => {
    setToDelete(club);
    setDeleteDialogOpen(true);
  };

  const cards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return nightClubs
      .filter(
        (b) =>
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q)
      )
      .map((b) => ({
        id: b.id,
        name: b.name,
        href: bo(`/night-clubs/${b.id}`),
        imageUrl: b.main_image_url || b.main_image_thumb_url,
        location: [b.city, b.country].filter(Boolean).join(", "),
        status: b.is_active ? ("available" as const) : ("inactive" as const),
        statusLabel: b.is_active ? "Actif" : "Inactif",
      }));
  }, [nightClubs, search, bo]);

  const deleteDialog = (
    <DeleteConfirmationDialog
      open={deleteDialogOpen}
      onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) setToDelete(null);
      }}
      onConfirm={() => {
        if (!toDelete) return;
        deleteMutation.mutate(toDelete.id, {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setToDelete(null);
          },
        });
      }}
      title="Supprimer le night-club"
      description={`Êtes-vous sûr de vouloir supprimer "${toDelete?.name}" ?`}
      isLoading={deleteMutation.isPending}
    />
  );

  if (isHostView) {
    return (
      <HostShell>
        <div className="mx-auto w-full max-w-6xl">
          <HostPageHeader
            eyebrow="Espace hôte"
            title="Night-Clubs"
            description="Gérez vos clubs et zones — ouvrez une fiche pour le détail."
            count={cards.length}
            countLabel={{ singular: "club", plural: "clubs" }}
            actionLabel="Ajouter un night-club"
            onAction={handleCreate}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rechercher un club…"
          />

          <div className="mt-8">
            <OwnerEstablishmentGallery
              items={cards}
              isLoading={isLoading}
              emptyTitle="Votre premier club vous attend"
              emptyDescription="Ajoutez un établissement pour commencer à recevoir vos clients sur Dolci Rêva."
              onEdit={(id) => router.push(bo(`/night-clubs/${id}/edit`))}
              onDelete={(id) => {
                const b = nightClubs.find((x) => x.id === id);
                if (b) handleDelete(b);
              }}
            />
          </div>
        </div>
        {deleteDialog}
      </HostShell>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <Music2 className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Night-Clubs</h1>
          <p className="text-sm text-gray-500">
            {nightClubs.length} night-club{nightClubs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-theme-primary" />
          </div>
        ) : (
          <NightClubTable
            data={nightClubs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={deleteMutation.isPending}
            addButton={<AddButton label="Nouveau night-club" onClick={handleCreate} />}
            onRefresh={() => refetch()}
            isRefreshing={isRefetching}
          />
        )}
      </div>
      {deleteDialog}
    </div>
  );
}
