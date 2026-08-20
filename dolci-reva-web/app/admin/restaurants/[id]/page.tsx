"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Armchair } from "lucide-react";
import { useRestaurant } from "@/hooks/use-restaurants";
import { HostEstablishmentDossier } from "@/components/admin/host/HostEstablishmentDossier";
import { HostInventorySection } from "@/components/admin/host/HostInventorySection";
import { InventoryFormDialog } from "@/components/admin/host/InventoryFormDialog";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import {
  useRestaurantTables,
  useCreateRestaurantTable,
  useUpdateRestaurantTable,
  useDeleteRestaurantTable,
  type RestaurantTable,
} from "@/hooks/use-establishment-inventory";

const TABLE_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "booth", label: "Banquette" },
  { value: "bar", label: "Comptoir" },
  { value: "private", label: "Privé" },
];

const FIELDS = [
  { name: "table_number", label: "Numéro", type: "text" as const, required: true },
  { name: "capacity", label: "Capacité", type: "number" as const, required: true },
  { name: "location", label: "Emplacement", type: "text" as const, placeholder: "Terrasse, fenêtre…" },
  { name: "table_type", label: "Type", type: "select" as const, required: true, options: TABLE_TYPES },
  { name: "is_active", label: "Table active", type: "checkbox" as const },
];

export default function RestaurantDossierPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const { data: tables = [], isLoading: loadingTables } = useRestaurantTables(id);
  const createMutation = useCreateRestaurantTable();
  const updateMutation = useUpdateRestaurantTable();
  const deleteMutation = useDeleteRestaurantTable();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [toDelete, setToDelete] = useState<RestaurantTable | null>(null);

  const items = useMemo(
    () =>
      tables.map((t) => ({
        id: t.id,
        title: t.display_name || `Table ${t.table_number}`,
        subtitle: `${t.table_type} · ${t.capacity} pers.${t.location ? ` · ${t.location}` : ""}`,
        active: t.is_active,
      })),
    [tables]
  );

  if (isLoading || error || !restaurant) {
    return (
      <HostEstablishmentDossier
        isLoading={isLoading}
        error={Boolean(error) || (!isLoading && !restaurant)}
        notFoundLabel="Restaurant introuvable"
        listPath="/restaurants"
        listLabel="Retour aux restaurants"
        editPath={`/restaurants/${id}/edit`}
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
        listPath="/restaurants"
        listLabel="Tous les restaurants"
        editPath={`/restaurants/${restaurant.id}/edit`}
        bookableId={restaurant.id}
        name={restaurant.name}
        cover={restaurant.main_image_url || restaurant.main_image_thumb_url}
        location={[restaurant.address, restaurant.city, restaurant.country]
          .filter(Boolean)
          .join(" · ")}
        statusAvailable={restaurant.is_active}
        statusLabel={restaurant.is_active ? "Actif" : "Inactif"}
        eyebrow="Restaurant"
        description={restaurant.description}
        galleryImages={restaurant.gallery_images}
        allImages={restaurant.all_images}
        featureCategories={restaurant.feature_categories}
        stats={[
          { label: "Ville", value: restaurant.city || "—" },
          { label: "Tables", value: String(tables.length), hint: "en ligne" },
          { label: "Capacité", value: String(tables.reduce((s, t) => s + t.capacity, 0)), hint: "couverts" },
          { label: "Statut", value: restaurant.is_active ? "Actif" : "Inactif" },
        ]}
        sidebarRows={[
          { label: "Statut", value: restaurant.is_active ? "Actif" : "Inactif" },
          { label: "Tables", value: String(tables.length) },
        ]}
      >
        <HostInventorySection
          eyebrow="Tables"
          title="Plan de salle"
          description="Gérez les tables proposées à la réservation."
          addLabel="Ajouter une table"
          onAdd={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          isLoading={loadingTables}
          emptyTitle="Aucune table"
          emptyDescription="Ajoutez des tables pour permettre les réservations."
          items={items}
          onEdit={(tableId) => {
            const t = tables.find((x) => x.id === tableId) || null;
            setEditing(t);
            setFormOpen(true);
          }}
          onDelete={(tableId) => {
            setToDelete(tables.find((x) => x.id === tableId) || null);
          }}
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
                is_active: editing.is_active,
              }
            : { table_type: "standard", capacity: 2, is_active: true }
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const data = {
            restaurant_id: restaurant.id,
            table_number: String(values.table_number || ""),
            capacity: Number(values.capacity || 1),
            location: values.location ? String(values.location) : undefined,
            table_type: String(values.table_type || "standard"),
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
            { id: toDelete.id, restaurantId: restaurant.id },
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
