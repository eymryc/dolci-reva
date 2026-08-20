"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Armchair } from "lucide-react";
import { useNightlifeVenue } from "@/hooks/use-nightlife-venues";
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

export default function LoungeDossierPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: lounge, isLoading, error } = useNightlifeVenue(id);
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
        meta: formatMoney(t.minimum_spend) || undefined,
        active: t.is_active,
      })),
    [tables]
  );

  if (isLoading || error || !lounge) {
    return (
      <HostEstablishmentDossier
        isLoading={isLoading}
        error={Boolean(error) || (!isLoading && !lounge)}
        notFoundLabel="Lounge introuvable"
        listPath="/lounges"
        listLabel="Retour aux lounges"
        editPath={`/lounges/${id}/edit`}
        bookableId={id}
        name=""
        location=""
        statusAvailable={false}
      />
    );
  }

  const types = (lounge.venue_type || []).join(" · ") || "Lounge";

  return (
    <>
      <HostEstablishmentDossier
        listPath="/lounges"
        listLabel="Tous les lounges"
        editPath={`/lounges/${lounge.id}/edit`}
        bookableId={lounge.id}
        name={lounge.name}
        cover={lounge.main_image_url || lounge.main_image_thumb_url}
        location={[lounge.address, lounge.city, lounge.country]
          .filter(Boolean)
          .join(" · ")}
        statusAvailable={lounge.is_active}
        statusLabel={lounge.is_active ? "Actif" : "Inactif"}
        eyebrow={types}
        description={lounge.description}
        galleryImages={lounge.gallery_images}
        allImages={lounge.all_images}
        featureCategories={lounge.feature_categories}
        stats={[
          { label: "Ville", value: lounge.city || "—" },
          { label: "Tables", value: String(tables.length) },
          {
            label: "Âge min.",
            value: lounge.age_restriction != null ? String(lounge.age_restriction) : "—",
            hint: "ans",
          },
          { label: "Statut", value: lounge.is_active ? "Actif" : "Inactif" },
        ]}
        sidebarRows={[
          { label: "Statut", value: lounge.is_active ? "Actif" : "Inactif" },
          { label: "Tables", value: String(tables.length) },
        ]}
      >
        <HostInventorySection
          eyebrow="Tables"
          title="Espaces & tables"
          description="Gérez les tables et canapés réservables."
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
            : { table_type: "sofa", capacity: 4, is_active: true }
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const data = {
            lounge_id: lounge.id,
            table_number: String(values.table_number || ""),
            capacity: Number(values.capacity || 1),
            location: values.location ? String(values.location) : undefined,
            table_type: String(values.table_type || "sofa"),
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
            { id: toDelete.id, loungeId: lounge.id },
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
