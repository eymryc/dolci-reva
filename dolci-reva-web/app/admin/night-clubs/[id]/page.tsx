"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid } from "lucide-react";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import type { NightlifeVenue } from "@/types/entities/nightlife-venue.types";
import { HostEstablishmentDossier } from "@/components/admin/host/HostEstablishmentDossier";
import { HostInventorySection } from "@/components/admin/host/HostInventorySection";
import { InventoryFormDialog } from "@/components/admin/host/InventoryFormDialog";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import {
  useNightClubAreas,
  useCreateNightClubArea,
  useUpdateNightClubArea,
  useDeleteNightClubArea,
  type NightClubArea,
} from "@/hooks/use-establishment-inventory";

const AREA_TYPES = [
  { value: "dance_floor", label: "Piste de danse" },
  { value: "vip_booth", label: "Box VIP" },
  { value: "bar_area", label: "Zone bar" },
  { value: "terrace", label: "Terrasse" },
  { value: "private_room", label: "Salle privée" },
  { value: "bottle_service", label: "Service bouteilles" },
];

const FIELDS = [
  { name: "area_name", label: "Nom de la zone", type: "text" as const, required: true },
  { name: "area_type", label: "Type", type: "select" as const, required: true, options: AREA_TYPES },
  { name: "location", label: "Emplacement", type: "text" as const },
  { name: "capacity", label: "Capacité", type: "number" as const },
  { name: "minimum_spend", label: "Minimum de dépense (F CFA)", type: "number" as const },
  { name: "table_fee", label: "Frais de table (F CFA)", type: "number" as const },
  { name: "reservation_required", label: "Réservation obligatoire", type: "checkbox" as const },
  { name: "is_active", label: "Zone active", type: "checkbox" as const },
];

function useNightClub(id: number) {
  return useQuery({
    queryKey: ["admin", "night-clubs", id],
    queryFn: async () => {
      const response = await api.get(`/night-clubs/${id}`);
      return extractApiData<NightlifeVenue>(response.data);
    },
    enabled: !!id,
  });
}

function formatMoney(v?: string | number | null) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n) || n <= 0) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function NightClubDossierPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: club, isLoading, error } = useNightClub(id);
  const { data: areas = [], isLoading: loadingAreas } = useNightClubAreas(id);
  const createMutation = useCreateNightClubArea();
  const updateMutation = useUpdateNightClubArea();
  const deleteMutation = useDeleteNightClubArea();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NightClubArea | null>(null);
  const [toDelete, setToDelete] = useState<NightClubArea | null>(null);

  const items = useMemo(
    () =>
      areas.map((a) => ({
        id: a.id,
        title: a.display_name || a.area_name,
        subtitle: `${a.area_type}${a.capacity != null ? ` · ${a.capacity} pers.` : ""}`,
        meta: [formatMoney(a.minimum_spend), formatMoney(a.table_fee)]
          .filter(Boolean)
          .join(" · ") || undefined,
        active: a.is_active,
      })),
    [areas]
  );

  if (isLoading || error || !club) {
    return (
      <HostEstablishmentDossier
        isLoading={isLoading}
        error={Boolean(error) || (!isLoading && !club)}
        notFoundLabel="Night-club introuvable"
        listPath="/night-clubs"
        listLabel="Retour aux night-clubs"
        editPath={`/night-clubs/${id}/edit`}
        bookableId={id}
        name=""
        location=""
        statusAvailable={false}
      />
    );
  }

  return (
    <>
      <HostEstablishmentDossier
        listPath="/night-clubs"
        listLabel="Tous les night-clubs"
        editPath={`/night-clubs/${club.id}/edit`}
        bookableId={club.id}
        name={club.name}
        cover={club.main_image_url || club.main_image_thumb_url}
        location={[club.address, club.city, club.country]
          .filter(Boolean)
          .join(" · ")}
        statusAvailable={club.is_active}
        statusLabel={club.is_active ? "Actif" : "Inactif"}
        eyebrow="Night-club"
        description={club.description}
        galleryImages={club.gallery_images}
        allImages={club.all_images}
        featureCategories={club.feature_categories}
        stats={[
          { label: "Ville", value: club.city || "—" },
          { label: "Zones", value: String(areas.length) },
          {
            label: "Âge min.",
            value: club.age_restriction != null ? String(club.age_restriction) : "—",
            hint: "ans",
          },
          { label: "Statut", value: club.is_active ? "Actif" : "Inactif" },
        ]}
        sidebarRows={[
          { label: "Statut", value: club.is_active ? "Actif" : "Inactif" },
          { label: "Zones", value: String(areas.length) },
        ]}
      >
        <HostInventorySection
          eyebrow="Zones"
          title="Espaces du club"
          description="VIP, piste, terrasse… les zones réservables par les clients."
          addLabel="Ajouter une zone"
          onAdd={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          isLoading={loadingAreas}
          emptyTitle="Aucune zone"
          emptyDescription="Ajoutez des zones pour permettre les réservations."
          items={items}
          onEdit={(areaId) => {
            setEditing(areas.find((x) => x.id === areaId) || null);
            setFormOpen(true);
          }}
          onDelete={(areaId) =>
            setToDelete(areas.find((x) => x.id === areaId) || null)
          }
          icon={<LayoutGrid className="mx-auto h-7 w-7 text-[#f08400]/55" />}
        />
      </HostEstablishmentDossier>

      <InventoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier la zone" : "Nouvelle zone"}
        fields={FIELDS}
        initialValues={
          editing
            ? {
                area_name: editing.area_name,
                area_type: editing.area_type,
                location: editing.location || "",
                capacity: editing.capacity ?? "",
                minimum_spend: editing.minimum_spend ?? "",
                table_fee: editing.table_fee ?? "",
                reservation_required: editing.reservation_required ?? false,
                is_active: editing.is_active,
              }
            : {
                area_type: "vip_booth",
                is_active: true,
                reservation_required: true,
              }
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const data = {
            night_club_id: club.id,
            area_name: String(values.area_name || ""),
            area_type: String(values.area_type || "vip_booth"),
            location: values.location ? String(values.location) : undefined,
            capacity:
              values.capacity != null && values.capacity !== ""
                ? Number(values.capacity)
                : null,
            minimum_spend:
              values.minimum_spend != null && values.minimum_spend !== ""
                ? Number(values.minimum_spend)
                : null,
            table_fee:
              values.table_fee != null && values.table_fee !== ""
                ? Number(values.table_fee)
                : null,
            reservation_required: Boolean(values.reservation_required),
            is_active: Boolean(values.is_active),
          };
          if (editing) {
            updateMutation.mutate(
              { id: editing.id, data },
              { onSuccess: () => setFormOpen(false) }
            );
          } else {
            createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
          }
        }}
      />

      <DeleteConfirmationDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(
            { id: toDelete.id, nightClubId: club.id },
            { onSuccess: () => setToDelete(null) }
          );
        }}
        title="Supprimer la zone"
        description="Cette action ne peut pas être annulée."
        itemName={toDelete?.area_name}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
