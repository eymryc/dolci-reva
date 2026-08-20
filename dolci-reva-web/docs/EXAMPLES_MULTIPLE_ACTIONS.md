# Exemples : Actions multiples dans DataTable

Ce document montre des exemples concrets d'utilisation de `createActionsColumn` pour gérer plusieurs actions dans `DataTable`.

## Exemple 1 : Table de restaurants avec actions basiques

```tsx
"use client";

import { DataTable } from "@/components/admin/shared/DataTable";
import { createActionsColumn } from "@/components/admin/shared/ActionsColumn";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Restaurant } from "@/types/entities/restaurant.types";

export function RestaurantTableExample({ 
  restaurants, 
  onEdit, 
  onDelete 
}: { 
  restaurants: Restaurant[];
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (restaurant: Restaurant) => void;
}) {
  const router = useRouter();

  const columns: ColumnDef<Restaurant>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="font-semibold">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "address",
      header: "Adresse",
    },
    {
      accessorKey: "city",
      header: "Ville",
    },
    createActionsColumn<Restaurant>({
      actions: [
        {
          label: "Voir",
          icon: <Eye className="mr-2 h-4 w-4" />,
          onClick: (restaurant) => router.push(`/admin/restaurants/${restaurant.id}`),
        },
        {
          label: "Modifier",
          icon: <Edit2 className="mr-2 h-4 w-4" />,
          onClick: (restaurant) => onEdit(restaurant),
        },
        {
          separator: true,
          label: "Supprimer",
          icon: <Trash2 className="mr-2 h-4 w-4" />,
          variant: "destructive",
          onClick: (restaurant) => onDelete(restaurant),
        },
      ],
    }),
  ];

  return (
    <DataTable
      data={restaurants}
      columns={columns}
      searchPlaceholder="Rechercher un restaurant..."
    />
  );
}
```

## Exemple 2 : Table de réservations avec actions conditionnelles

```tsx
"use client";

import { DataTable } from "@/components/admin/shared/DataTable";
import { createActionsColumn } from "@/components/admin/shared/ActionsColumn";
import { ColumnDef } from "@tanstack/react-table";
import { XCircle, Trash2, Eye, Download } from "lucide-react";
import type { Booking } from "@/types/entities/booking.types";

export function BookingTableExample({ 
  bookings, 
  onCancel, 
  onDelete 
}: { 
  bookings: Booking[];
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}) {
  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "status",
      header: "Statut",
    },
    createActionsColumn<Booking>({
      actions: [
        {
          label: "Voir détails",
          icon: <Eye className="mr-2 h-4 w-4" />,
          onClick: (booking) => console.log("Voir", booking),
        },
        {
          label: "Télécharger",
          icon: <Download className="mr-2 h-4 w-4" />,
          onClick: (booking) => console.log("Télécharger", booking),
        },
        {
          separator: true,
          label: "Annuler",
          icon: <XCircle className="mr-2 h-4 w-4" />,
          onClick: (booking) => onCancel(booking),
          // Désactiver si déjà annulé ou terminé
          disabled: (booking) => 
            booking.status === "ANNULE" || booking.status === "TERMINE",
        },
        {
          label: "Supprimer",
          icon: <Trash2 className="mr-2 h-4 w-4" />,
          variant: "destructive",
          onClick: (booking) => onDelete(booking),
        },
      ],
      // Masquer complètement la colonne si aucune action disponible
      shouldHide: (booking) => booking.status === "TERMINE",
    }),
  ];

  return (
    <DataTable
      data={bookings}
      columns={columns}
      searchPlaceholder="Rechercher une réservation..."
    />
  );
}
```

## Exemple 3 : Table avec actions multiples et permissions

```tsx
"use client";

import { DataTable } from "@/components/admin/shared/DataTable";
import { createActionsColumn } from "@/components/admin/shared/ActionsColumn";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Eye, Copy, UserCog, Ban } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import type { User } from "@/types/entities/user.types";

export function UserTableExample({ 
  users, 
  onEdit, 
  onDelete 
}: { 
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  const { canEditUsers, canDeleteUsers, canManagePermissions } = usePermissions();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    createActionsColumn<User>({
      actions: [
        {
          label: "Voir",
          icon: <Eye className="mr-2 h-4 w-4" />,
          onClick: (user) => console.log("Voir", user),
        },
        ...(canEditUsers ? [{
          label: "Modifier",
          icon: <Edit2 className="mr-2 h-4 w-4" />,
          onClick: (user) => onEdit(user),
        }] : []),
        {
          label: "Dupliquer",
          icon: <Copy className="mr-2 h-4 w-4" />,
          onClick: (user) => console.log("Dupliquer", user),
        },
        ...(canManagePermissions ? [{
          separator: true,
          label: "Gérer permissions",
          icon: <UserCog className="mr-2 h-4 w-4" />,
          onClick: (user) => console.log("Permissions", user),
        }] : []),
        {
          label: "Suspendre",
          icon: <Ban className="mr-2 h-4 w-4" />,
          onClick: (user) => console.log("Suspendre", user),
          disabled: (user) => user.is_suspended,
        },
        ...(canDeleteUsers ? [{
          separator: true,
          label: "Supprimer",
          icon: <Trash2 className="mr-2 h-4 w-4" />,
          variant: "destructive",
          onClick: (user) => onDelete(user),
        }] : []),
      ].filter(Boolean), // Filtrer les undefined
    }),
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      searchPlaceholder="Rechercher un utilisateur..."
    />
  );
}
```

## Exemple 4 : Table avec actions dynamiques basées sur l'état

```tsx
"use client";

import { DataTable } from "@/components/admin/shared/DataTable";
import { createActionsColumn } from "@/components/admin/shared/ActionsColumn";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye,
  Download 
} from "lucide-react";
import type { Dwelling } from "@/types/entities/dwelling.types";

export function DwellingTableExample({ 
  dwellings, 
  onEdit, 
  onDelete,
  onToggleAvailability 
}: { 
  dwellings: Dwelling[];
  onEdit: (dwelling: Dwelling) => void;
  onDelete: (dwelling: Dwelling) => void;
  onToggleAvailability: (dwelling: Dwelling) => void;
}) {
  const columns: ColumnDef<Dwelling>[] = [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "is_available",
      header: "Disponibilité",
      cell: ({ row }) => (
        <span>{row.getValue("is_available") ? "Disponible" : "Occupé"}</span>
      ),
    },
    createActionsColumn<Dwelling>({
      actions: [
        {
          label: "Voir",
          icon: <Eye className="mr-2 h-4 w-4" />,
          onClick: (dwelling) => console.log("Voir", dwelling),
        },
        {
          label: "Modifier",
          icon: <Edit2 className="mr-2 h-4 w-4" />,
          onClick: (dwelling) => onEdit(dwelling),
        },
        {
          separator: true,
          // Label dynamique basé sur l'état
          label: (dwelling) => dwelling.is_available 
            ? "Marquer occupé" 
            : "Marquer disponible",
          icon: (dwelling) => dwelling.is_available 
            ? <XCircle className="mr-2 h-4 w-4" />
            : <CheckCircle className="mr-2 h-4 w-4" />,
          onClick: (dwelling) => onToggleAvailability(dwelling),
        },
        {
          separator: true,
          label: "Exporter",
          icon: <Download className="mr-2 h-4 w-4" />,
          onClick: (dwelling) => console.log("Exporter", dwelling),
        },
        {
          separator: true,
          label: "Supprimer",
          icon: <Trash2 className="mr-2 h-4 w-4" />,
          variant: "destructive",
          onClick: (dwelling) => onDelete(dwelling),
        },
      ],
    }),
  ];

  return (
    <DataTable
      data={dwellings}
      columns={columns}
      searchPlaceholder="Rechercher un hébergement..."
    />
  );
}
```

## Notes importantes

1. **Type safety** : `createActionsColumn<YourType>()` garantit le typage correct
2. **Séparateurs** : Utilisez `separator: true` pour séparer visuellement les actions
3. **Variants** : Utilisez `variant: "destructive"` pour les actions dangereuses (rouge)
4. **Conditionnel** : `disabled` peut être un booléen ou une fonction `(row) => boolean`
5. **Masquage** : `shouldHide` permet de masquer complètement la colonne pour certaines lignes
6. **Icônes** : Utilisez les icônes de `lucide-react` pour la cohérence

## Bonnes pratiques

- ✅ Groupez les actions similaires ensemble
- ✅ Utilisez des séparateurs pour distinguer les groupes d'actions
- ✅ Marquez les actions destructives avec `variant: "destructive"`
- ✅ Désactivez les actions non applicables plutôt que de les masquer
- ✅ Utilisez des icônes claires et cohérentes
- ✅ Testez les actions conditionnelles avec différents états de données



