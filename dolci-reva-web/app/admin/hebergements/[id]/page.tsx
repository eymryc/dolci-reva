"use client";

import { useParams } from "next/navigation";
import { useDwelling } from "@/hooks/use-dwellings";
import { HostEstablishmentDossier } from "@/components/admin/host/HostEstablishmentDossier";

function formatPrice(price: string | number) {
  const n = Number(price);
  if (Number.isNaN(n)) return String(price);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function HebergementDossierPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: dwelling, isLoading, error } = useDwelling(id);

  if (isLoading || error || !dwelling) {
    return (
      <HostEstablishmentDossier
        isLoading={isLoading}
        error={Boolean(error) || (!isLoading && !dwelling)}
        notFoundLabel="Hébergement introuvable"
        listPath="/hebergements"
        listLabel="Retour aux hébergements"
        editPath={`/hebergements/${id}/edit`}
        bookableId={id}
        name=""
        location=""
        statusAvailable={false}
      />
    );
  }

  const name = dwelling.type
    ? `${dwelling.type} · ${dwelling.city}`
    : dwelling.address || `Hébergement #${dwelling.id}`;

  const available = Boolean(dwelling.is_available && dwelling.is_active);

  return (
    <HostEstablishmentDossier
      listPath="/hebergements"
      listLabel="Tous les hébergements"
      editPath={`/hebergements/${dwelling.id}/edit`}
      bookableId={dwelling.id}
      name={name}
      cover={dwelling.main_image_url || dwelling.main_image_thumb_url}
      location={[dwelling.address, dwelling.city, dwelling.country]
        .filter(Boolean)
        .join(" · ")}
      statusAvailable={available}
      statusLabel={
        !dwelling.is_active
          ? "Inactif"
          : dwelling.is_available
            ? "Disponible"
            : "Indisponible"
      }
      eyebrow={[dwelling.structure_type_label, dwelling.construction_type_label]
        .filter(Boolean)
        .join(" · ")}
      description={dwelling.description}
      galleryImages={dwelling.gallery_images}
      allImages={dwelling.all_images}
      stats={[
        {
          label: "Loyer",
          value: formatPrice(dwelling.rent),
          hint: "/ mois",
        },
        {
          label: "Pièces",
          value: dwelling.piece_number != null ? String(dwelling.piece_number) : "—",
        },
        {
          label: "Visite",
          value: formatPrice(dwelling.visite_price),
        },
        {
          label: "Statut",
          value: dwelling.rental_status || "—",
        },
      ]}
      sidebarRows={[
        {
          label: "Statut",
          value: dwelling.is_active ? "Actif" : "Inactif",
        },
        ...(dwelling.bathrooms != null
          ? [{ label: "Salles de bain", value: String(dwelling.bathrooms) }]
          : []),
      ]}
    />
  );
}
