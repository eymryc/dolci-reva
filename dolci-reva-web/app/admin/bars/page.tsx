"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import { Wine, Loader2 } from "lucide-react";
import { AddButton } from "@/components/admin/shared/AddButton";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { BarTable } from "@/components/admin/bars/BarTable";
import { HostPageHeader } from "@/components/admin/host/HostPageHeader";
import { OwnerEstablishmentGallery } from "@/components/admin/host/OwnerEstablishmentGallery";
import { HostShell } from "@/components/admin/host/HostShell";
import { useBackofficePath } from "@/hooks/use-host-view";
import { useIsHostView } from "@/hooks/use-host-view";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import type { NightlifeVenue } from "@/types/entities/nightlife-venue.types";

function useAdminBars() {
  return useQuery({
    queryKey: ["admin", "bars"],
    queryFn: async () => {
      const response = await api.get("/bars");
      const data = extractApiData<NightlifeVenue[]>(response.data);
      return data || [];
    },
  });
}

function useDeleteBar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/bars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bars"] });
      toast.success("Bar supprimé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Erreur lors de la suppression du bar" });
    },
  });
}

export default function BarsAdminPage() {
  const bo = useBackofficePath();
  const router = useRouter();
  const isHostView = useIsHostView();
  const { data: bars = [], isLoading, isRefetching, refetch } = useAdminBars();
  const deleteMutation = useDeleteBar();
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<NightlifeVenue | null>(null);

  const handleCreate = () => router.push(bo("/bars/new"));
  const handleEdit = (bar: NightlifeVenue) => router.push(bo(`/bars/${bar.id}/edit`));
  const handleDelete = (bar: NightlifeVenue) => {
    setToDelete(bar);
    setDeleteDialogOpen(true);
  };

  const cards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bars
      .filter(
        (b) =>
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q)
      )
      .map((b) => ({
        id: b.id,
        name: b.name,
        href: bo(`/bars/${b.id}`),
        imageUrl: b.main_image_url || b.main_image_thumb_url,
        location: [b.city, b.country].filter(Boolean).join(", "),
        status: b.is_active ? ("available" as const) : ("inactive" as const),
        statusLabel: b.is_active ? "Actif" : "Inactif",
      }));
  }, [bars, search, bo]);

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
      title="Supprimer le bar"
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
            title="Bars"
            description="Gérez vos bars et espaces de soirée — ouvrez une fiche pour le détail."
            count={cards.length}
            countLabel={{ singular: "bar", plural: "bars" }}
            actionLabel="Ajouter un bar"
            onAction={handleCreate}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rechercher un bar…"
          />

          <div className="mt-8">
            <OwnerEstablishmentGallery
              items={cards}
              isLoading={isLoading}
              emptyTitle="Votre premier bar vous attend"
              emptyDescription="Ajoutez un établissement pour commencer à recevoir vos clients sur Dolci Rêva."
              onEdit={(id) => router.push(bo(`/bars/${id}/edit`))}
              onDelete={(id) => {
                const b = bars.find((x) => x.id === id);
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <Wine className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bars</h1>
          <p className="text-sm text-gray-500">
            {bars.length} bar{bars.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-theme-primary" />
          </div>
        ) : (
          <BarTable
            data={bars}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={deleteMutation.isPending}
            addButton={<AddButton label="Nouveau bar" onClick={handleCreate} />}
            onRefresh={() => refetch()}
            isRefreshing={isRefetching}
          />
        )}
      </div>
      {deleteDialog}
    </div>
  );
}
