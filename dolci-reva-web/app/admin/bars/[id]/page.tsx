"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Armchair } from "lucide-react";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import type { NightlifeVenue } from "@/types/entities/nightlife-venue.types";
import { HostEstablishmentDossier } from "@/components/admin/host/HostEstablishmentDossier";
import { HostInventorySection } from "@/components/admin/host/HostInventorySection";
import { InventoryFormDialog } from "@/components/admin/host/InventoryFormDialog";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import {
  useLoungeTables,
  useCreateLoungeTable,
  useUpdateLoungeTable,
  useDeleteLoungeTable,
  type LoungeTable,
} from "@/hooks/use-establishment-inventory";

const TABLE_TYPES = [
  { value: "sofa", label: "Canapé" },
  { value: "high_table", label: "Table haute" },
  { value: "low_table", label: "Table basse" },
  { value: "bar_counter", label: "Comptoir" },
  { value: "private_booth", label: "Espace privé" },
  { value: "outdoor", label: "Extérieur" },
];

const FIELDS = [
  { name: "table_number", label: "Numéro", type: "text" as const, required: true },
  { name: "capacity", label: "Capacité", type: "number" as const, required: true },
  { name: "location", label: "Emplacement", type: "text" as const },
  { name: "table_type", label: "Type", type: "select" as const, required: true, options: TABLE_TYPES },
  { name: "minimum_spend", label: "Minimum de dépense (F CFA)", type: "number" as const },
  { name: "is_active", label: "Table active", type: "checkbox" as const },
];

function useBar(id: number) {
  return useQuery({
    queryKey: ["admin", "bars", id],
    queryFn: async () => {
      const response = await api.get(`/bars/${id}`);
      return extractApiData<NightlifeVenue>(response.data);
    },
    enabled: !!id,
  });
}

export default function BarDossierPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: bar, isLoading, error } = useBar(id);
  const { data: tables = [], isLoading: loadingTables } = useLoungeTables(id);
  const createMutation = useCreateLoungeTable();
  const updateMutation = useUpdateLoungeTable();
  const deleteMutation = useDeleteLoungeTable();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LoungeTable | null>(null);
  const [toDelete, setToDelete] = useState<LoungeTable | null>(null);

  const items = useMemo(
    () =>
      tables.map((t) => ({
        id: t.id,
        title: t.display_name || `Table ${t.table_number}`,
        subtitle: `${t.table_type} · ${t.capacity} pers.`,
        active: t.is_active,
      })),
    [tables]
  );

  if (isLoading || error || !bar) {
    return (
      <HostEstablishmentDossier
        isLoading={isLoading}
        error={Boolean(error) || (!isLoading && !bar)}
        notFoundLabel="Bar introuvable"
        listPath="/bars"
        listLabel="Retour aux bars"
        editPath={`/bars/${id}/edit`}
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
        listPath="/bars"
        listLabel="Tous les bars"
        editPath={`/bars/${bar.id}/edit`}
        bookableId={bar.id}
        name={bar.name}
        cover={bar.main_image_url || bar.main_image_thumb_url}
        location={[bar.address, bar.city, bar.country].filter(Boolean).join(" · ")}
        statusAvailable={bar.is_active}
        statusLabel={bar.is_active ? "Actif" : "Inactif"}
        eyebrow="Bar"
        description={bar.description}
        galleryImages={bar.gallery_images}
        allImages={bar.all_images}
        featureCategories={bar.feature_categories}
        stats={[
          { label: "Ville", value: bar.city || "—" },
          { label: "Tables", value: String(tables.length) },
          {
            label: "Âge min.",
            value: bar.age_restriction != null ? String(bar.age_restriction) : "—",
            hint: "ans",
          },
          { label: "Statut", value: bar.is_active ? "Actif" : "Inactif" },
        ]}
        sidebarRows={[{ label: "Statut", value: bar.is_active ? "Actif" : "Inactif" }]}
      >
        <HostInventorySection
          eyebrow="Tables"
          title="Plan du bar"
          description="Gérez les tables et comptoirs réservables."
          addLabel="Ajouter une table"
          onAdd={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          isLoading={loadingTables}
          emptyTitle="Aucune table"
          emptyDescription="Ajoutez des tables pour recevoir des réservations."
          items={items}
          onEdit={(tableId) => {
            setEditing(tables.find((x) => x.id === tableId) || null);
            setFormOpen(true);
          }}
          onDelete={(tableId) =>
            setToDelete(tables.find((x) => x.id === tableId) || null)
          }
          icon={<Armchair className="mx-auto h-7 w-7 text-[#f08400]/55" />}
        />
      </HostEstablishmentDossier>

      <InventoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier la table" : "Nouvelle table"}
        fields={FIELDS}
        initialValues={
          editing
            ? {
                table_number: editing.table_number,
                capacity: editing.capacity,
                location: editing.location || "",
                table_type: editing.table_type,
                minimum_spend: editing.minimum_spend ?? "",
                is_active: editing.is_active,
              }
            : { table_type: "bar_counter", capacity: 2, is_active: true }
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const data = {
            lounge_id: bar.id,
            table_number: String(values.table_number || ""),
            capacity: Number(values.capacity || 1),
            location: values.location ? String(values.location) : undefined,
            table_type: String(values.table_type || "bar_counter"),
            minimum_spend:
              values.minimum_spend != null && values.minimum_spend !== ""
                ? Number(values.minimum_spend)
                : null,
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
            { id: toDelete.id, loungeId: bar.id },
            { onSuccess: () => setToDelete(null) }
          );
        }}
        title="Supprimer la table"
        description="Cette action ne peut pas être annulée."
        itemName={toDelete?.display_name || toDelete?.table_number}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
