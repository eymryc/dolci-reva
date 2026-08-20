# Guide pour des tables de données uniformes

Ce guide explique comment utiliser le composant `DataTable` générique pour créer des tables uniformes dans toute l'application.

## Composant de base : `DataTable`

Le composant `DataTable` se trouve dans `/components/admin/shared/DataTable.tsx` et fournit une structure uniforme pour toutes les tables de l'application.

### Caractéristiques uniformes

Toutes les tables utilisant `DataTable` partagent :
- ✅ Même structure de layout (recherche, table, pagination)
- ✅ Même style visuel (couleurs, espacements, bordures)
- ✅ Même comportement de pagination (toujours visible avec format standardisé)
- ✅ Même gestion des états (chargement, vide, erreur)
- ✅ Même responsive design

## Utilisation

### Exemple basique

```tsx
import { DataTable } from "@/components/admin/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";

// Définir les colonnes
const columns: ColumnDef<YourType>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  // ... autres colonnes
];

// Utiliser le composant
<DataTable
  data={yourData}
  columns={columns}
  isLoading={isLoading}
  searchPlaceholder="Rechercher..."
  emptyMessage="Aucune donnée"
  onRefresh={refetch}
  addButton={<Button>Ajouter</Button>}
/>
```

### Exemple avec sélection de lignes

```tsx
<DataTable
  data={yourData}
  columns={columns}
  enableRowSelection={true} // Active les checkboxes
  // ... autres props
/>
```

### Exemple sans sélection de lignes

```tsx
<DataTable
  data={yourData}
  columns={columns}
  enableRowSelection={false} // Désactive les checkboxes
  // ... autres props
/>
```

## Migration des tables existantes

Pour migrer une table existante vers `DataTable` :

1. **Importer DataTable** au lieu du composant spécifique
2. **Définir les colonnes** avec le même format
3. **Remplacer l'utilisation** de l'ancienne table par `DataTable`

### Avant (table spécifique)

```tsx
import { RestaurantTable } from "@/components/admin/restaurants/RestaurantTable";

<RestaurantTable
  data={restaurants}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isLoading={isLoading}
/>
```

### Après (avec DataTable)

```tsx
import { DataTable } from "@/components/admin/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Restaurant>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionButtons
        onEdit={() => handleEdit(row.original)}
        onDelete={() => handleDelete(row.original)}
      />
    ),
  },
];

<DataTable
  data={restaurants}
  columns={columns}
  isLoading={isLoading}
  searchPlaceholder="Rechercher un restaurant..."
/>
```

## Structure standardisée

Toutes les tables suivent cette structure :

```
┌─────────────────────────────────────────┐
│  [Recherche]  [Refresh]  [Add Button]  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  [Header Row]                     │  │
│  ├───────────────────────────────────┤  │
│  │  [Data Rows]                      │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Affichage de X à Y de Z résultats     │
│  [<<] [<] Page X de Y [>] [>>]         │
└─────────────────────────────────────────┘
```

## Props disponibles

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `data` | `TData[]` | **requis** | Données à afficher |
| `columns` | `ColumnDef<TData>[]` | **requis** | Définitions des colonnes |
| `isLoading` | `boolean` | `false` | État de chargement |
| `addButton` | `React.ReactNode` | `undefined` | Bouton d'ajout |
| `onRefresh` | `() => void` | `undefined` | Callback de rafraîchissement |
| `isRefreshing` | `boolean` | `false` | État de rafraîchissement |
| `searchPlaceholder` | `string` | `"Rechercher..."` | Placeholder de recherche |
| `pageSize` | `number` | `10` | Taille de page |
| `enableRowSelection` | `boolean` | `true` | Active la sélection de lignes |
| `emptyMessage` | `string` | `"Aucune donnée"` | Message quand vide |
| `className` | `string` | `""` | Classe CSS supplémentaire |
| `tableOptions` | `Partial<TableOptions<TData>>` | `{}` | Options React Table |

## Bonnes pratiques

1. **Toujours utiliser DataTable** pour les nouvelles tables
2. **Définir les colonnes** de manière cohérente
3. **Utiliser les mêmes placeholders** pour des types similaires
4. **Respecter la structure** standardisée
5. **Tester la pagination** avec différentes tailles de données

## Tables à migrer

Les tables suivantes devraient être migrées vers `DataTable` pour une uniformité complète :

- [ ] `RestaurantTable`
- [ ] `MenuCategoryTable`
- [ ] `MenuItemTable`
- [ ] `LoungeTable`
- [ ] `LoungeProductCategoryTable`
- [ ] `LoungeProductTable`
- [ ] `HotelTable`
- [ ] `RoomTable`
- [ ] `DwellingTable`
- [ ] `ResidenceTable`
- [ ] `UserTable`
- [ ] `BookingTable` (déjà aligné, peut servir de référence)

## Gestion des actions multiples

Pour gérer plusieurs actions dans une table (modifier, supprimer, voir détails, etc.), vous avez deux options :

### Option 1 : Utiliser `createActionsColumn` (Recommandé)

Le composant helper `createActionsColumn` facilite la création d'une colonne d'actions avec plusieurs actions personnalisées :

```tsx
import { DataTable } from "@/components/admin/shared/DataTable";
import { createActionsColumn } from "@/components/admin/shared/ActionsColumn";
import { Edit2, Trash2, Eye, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

const router = useRouter();

const columns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  // ... autres colonnes
  createActionsColumn<Restaurant>({
    actions: [
      {
        label: "Modifier",
        icon: <Edit2 className="mr-2 h-4 w-4" />,
        onClick: (restaurant) => handleEdit(restaurant),
      },
      {
        label: "Voir détails",
        icon: <Eye className="mr-2 h-4 w-4" />,
        onClick: (restaurant) => router.push(`/admin/restaurants/${restaurant.id}`),
      },
      {
        label: "Dupliquer",
        icon: <Copy className="mr-2 h-4 w-4" />,
        onClick: (restaurant) => handleDuplicate(restaurant),
      },
      {
        separator: true, // Ajoute un séparateur avant cette action
        label: "Supprimer",
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        variant: "destructive", // Style rouge pour les actions dangereuses
        onClick: (restaurant) => handleDelete(restaurant),
      },
    ],
  }),
];
```

### Option 2 : Colonne d'actions personnalisée

Vous pouvez aussi créer manuellement une colonne d'actions avec un `DropdownMenu` :

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

const columns: ColumnDef<Restaurant>[] = [
  // ... autres colonnes
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const restaurant = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(restaurant)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(restaurant)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
```

### Actions conditionnelles

Vous pouvez rendre les actions conditionnelles avec `disabled` ou `shouldHide` :

```tsx
createActionsColumn<Booking>({
  actions: [
    {
      label: "Annuler",
      icon: <XCircle className="mr-2 h-4 w-4" />,
      onClick: (booking) => handleCancel(booking),
      // Désactiver si déjà annulé
      disabled: (booking) => booking.status === "ANNULE",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      variant: "destructive",
      onClick: (booking) => handleDelete(booking),
    },
  ],
  // Masquer complètement la colonne si aucune action disponible
  shouldHide: (booking) => booking.status === "TERMINE",
}),
```

### Exemple complet avec plusieurs actions

```tsx
import { DataTable } from "@/components/admin/shared/DataTable";
import { createActionsColumn } from "@/components/admin/shared/ActionsColumn";
import { Edit2, Trash2, Eye, Copy, Download } from "lucide-react";

const columns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    accessorKey: "address",
    header: "Adresse",
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
        onClick: (restaurant) => handleEdit(restaurant),
      },
      {
        label: "Dupliquer",
        icon: <Copy className="mr-2 h-4 w-4" />,
        onClick: (restaurant) => handleDuplicate(restaurant),
      },
      {
        label: "Exporter",
        icon: <Download className="mr-2 h-4 w-4" />,
        onClick: (restaurant) => handleExport(restaurant),
      },
      {
        separator: true,
        label: "Supprimer",
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        variant: "destructive",
        onClick: (restaurant) => handleDelete(restaurant),
        disabled: (restaurant) => restaurant.is_active, // Désactiver si actif
      },
    ],
  }),
];

<DataTable
  data={restaurants}
  columns={columns}
  isLoading={isLoading}
/>
```

## Notes

- Le composant `DataTable` gère automatiquement la colonne de sélection si `enableRowSelection={true}`
- La pagination est toujours visible (pas de condition)
- Le style est entièrement responsive
- Les états de chargement et vide sont gérés de manière uniforme
- Utilisez `createActionsColumn` pour une approche standardisée des actions multiples
- Les actions avec `variant: "destructive"` sont automatiquement stylées en rouge


