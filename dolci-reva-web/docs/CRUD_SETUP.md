# Guide de Mise en Place du CRUD - Business Type

Ce document décrit l'architecture complète et les étapes pour mettre en place un CRUD (Create, Read, Update, Delete) dans l'application Dolci Rêva.

## 📋 Table des Matières

1. [Outils et Technologies](#outils-et-technologies)
2. [Architecture](#architecture)
3. [Étapes de Mise en Place](#étapes-de-mise-en-place)
4. [Structure des Fichiers](#structure-des-fichiers)
5. [Configuration API](#configuration-api)
6. [Utilisation](#utilisation)
7. [Exemple Complet](#exemple-complet)

---

## 🛠️ Outils et Technologies

### Packages Principaux

| Package | Version | Usage |
|---------|---------|-------|
| `@tanstack/react-query` | ^5.90.6 | Gestion des requêtes API, cache, mutations |
| `@tanstack/react-query-devtools` | ^5.90.2 | Outils de développement pour React Query |
| `@tanstack/react-table` | ^8.21.3 | Tableaux avancés avec tri, pagination, recherche |
| `react-hook-form` | ^7.58.1 | Gestion de formulaires performante |
| `zod` | ^3.25.67 | Validation de schémas TypeScript |
| `@hookform/resolvers` | ^5.1.1 | Intégration Zod avec React Hook Form |
| `axios` | ^1.10.0 | Client HTTP pour les requêtes API |
| `sonner` | ^2.0.5 | Notifications toast modernes |

### Pourquoi Ces Outils ?

- **TanStack Query** : Cache automatique, synchronisation, optimistic updates, gestion du loading/error
- **React Table** : Tableaux performants avec tri, pagination, filtres, sorting
- **React Hook Form** : Performance optimale, validation intégrée, moins de re-renders
- **Zod** : Validation type-safe, schémas réutilisables
- **Axios** : Intercepteurs, gestion d'erreurs centralisée, support des tokens

---

## 🏗️ Architecture

### Flux de Données

```
┌─────────────────┐
│  Page Component │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Query    │ ◄─── Hooks (useBusinessTypes, etc.)
│  (TanStack)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Axios Client   │ ◄─── API Configuration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
└─────────────────┘
```

### Composants

```
Settings Page
├── BusinessTypeTable (React Table)
│   ├── Columns (ID, Name, Description, Actions)
│   ├── Search
│   └── Pagination
├── BusinessTypeModal (Dialog)
│   └── BusinessTypeForm (React Hook Form + Zod)
│       ├── Validation
│       └── Submit Handler
└── Hooks (TanStack Query)
    ├── useBusinessTypes (GET all)
    ├── useCreateBusinessType (POST)
    ├── useUpdateBusinessType (PUT)
    └── useDeleteBusinessType (DELETE)
```

---

## 📝 Étapes de Mise en Place

### Étape 1 : Installation des Packages

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install @tanstack/react-table
npm install react-hook-form zod @hookform/resolvers
npm install axios sonner
```

### Étape 2 : Configuration du QueryClient Provider

**Fichier : `providers/QueryProvider.tsx`**

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Intégration dans `app/layout.tsx` :**

```typescript
import { QueryProvider } from "@/providers/QueryProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Étape 3 : Configuration Axios

**Fichier : `lib/axios.ts`**

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://v2-dolcireva-api.test/api/",
});

// Interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("access_token") 
      : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Déconnexion ou redirection
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Étape 4 : Création des Hooks TanStack Query

**Fichier : `hooks/use-business-types.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

// Types
export interface BusinessType {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessTypeFormData {
  name: string;
  description?: string;
}

// GET - Fetch all
export function useBusinessTypes() {
  return useQuery({
    queryKey: ["business-types"],
    queryFn: async () => {
      const response = await api.get("/business-types");
      return response.data.data as BusinessType[];
    },
  });
}

// POST - Create
export function useCreateBusinessType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BusinessTypeFormData) => {
      const response = await api.post("/business-types", data);
      return response.data.data as BusinessType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-types"] });
      toast.success("Business type created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create");
    },
  });
}

// PUT - Update
export function useUpdateBusinessType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BusinessTypeFormData }) => {
      const response = await api.put(`/business-types/${id}`, data);
      return response.data.data as BusinessType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-types"] });
      toast.success("Business type updated successfully!");
    },
  });
}

// DELETE - Delete
export function useDeleteBusinessType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/business-types/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-types"] });
      toast.success("Business type deleted successfully!");
    },
  });
}
```

### Étape 5 : Création du Formulaire avec React Hook Form + Zod

**Fichier : `components/admin/BusinessTypeForm.tsx`**

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const businessTypeSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type BusinessTypeFormValues = z.infer<typeof businessTypeSchema>;

export function BusinessTypeForm({ onSubmit, onCancel, defaultValues, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(businessTypeSchema),
    defaultValues: defaultValues || { name: "", description: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      {/* ... */}
    </form>
  );
}
```

### Étape 6 : Création du Tableau avec React Table

**Fichier : `components/admin/BusinessTypeTable.tsx`**

Utilise `@tanstack/react-table` pour :
- Tri des colonnes
- Pagination
- Recherche globale
- Actions (Edit, Delete)

### Étape 7 : Création du Modal

**Fichier : `components/admin/BusinessTypeModal.tsx`**

Utilise `@radix-ui/react-dialog` pour afficher le formulaire dans un modal.

### Étape 8 : Intégration dans la Page

**Fichier : `app/admin/settings/page.tsx`**

```typescript
import { useBusinessTypes, useCreateBusinessType, ... } from "@/hooks/use-business-types";
import { BusinessTypeTable } from "@/components/admin/BusinessTypeTable";
import { BusinessTypeModal } from "@/components/admin/BusinessTypeModal";

export default function SettingsPage() {
  const { data: businessTypes, isLoading } = useBusinessTypes();
  const createMutation = useCreateBusinessType();
  const updateMutation = useUpdateBusinessType();
  const deleteMutation = useDeleteBusinessType();
  
  // Handlers...
  
  return (
    <Tabs>
      <TabsContent value="business-type">
        <BusinessTypeTable 
          data={businessTypes} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <BusinessTypeModal {...modalProps} />
      </TabsContent>
    </Tabs>
  );
}
```

---

## 📁 Structure des Fichiers

```
project/
├── app/
│   ├── layout.tsx                    # Root layout avec QueryProvider
│   └── admin/
│       └── settings/
│           └── page.tsx              # Page principale avec tabs
├── components/
│   └── admin/
│       ├── BusinessTypeForm.tsx      # Formulaire avec validation
│       ├── BusinessTypeTable.tsx      # Tableau React Table
│       └── BusinessTypeModal.tsx     # Modal pour Create/Edit
├── hooks/
│   └── use-business-types.ts         # Hooks TanStack Query
├── lib/
│   └── axios.ts                      # Configuration Axios
├── providers/
│   └── QueryProvider.tsx             # QueryClient Provider
└── docs/
    └── CRUD_SETUP.md                 # Ce fichier
```

---

## ⚙️ Configuration API

### Base URL

```typescript
baseURL: "http://v2-dolcireva-api.test/api/"
```

### Endpoints Requis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/business-types` | Liste des business types |
| GET | `/business-types/{id}` | Détails d'un business type |
| POST | `/business-types` | Créer un business type |
| PUT | `/business-types/{id}` | Modifier un business type |
| DELETE | `/business-types/{id}` | Supprimer un business type |

### Format de Réponse Attendu

```json
{
  "data": [
    {
      "id": 1,
      "name": "Hotel",
      "description": "Établissements hôteliers",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

### Format de Requête (POST/PUT)

```json
{
  "name": "Hotel",
  "description": "Établissements hôteliers"
}
```

---

## 🚀 Utilisation

### Dans un Composant

```typescript
import { useBusinessTypes, useCreateBusinessType } from "@/hooks/use-business-types";

function MyComponent() {
  // Fetch data
  const { data, isLoading, error } = useBusinessTypes();
  
  // Create mutation
  const createMutation = useCreateBusinessType();
  
  const handleCreate = () => {
    createMutation.mutate({
      name: "New Business Type",
      description: "Description"
    });
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
```

---

## 📝 Exemple Complet

### Workflow Complet

1. **Page Load** → `useBusinessTypes()` fetch les données
2. **User Click "Add"** → Ouvre le modal avec formulaire vide
3. **User Fill Form** → Validation avec Zod
4. **User Submit** → `createMutation.mutate()` → API POST → Success Toast → Cache invalidation → Table refresh
5. **User Click Edit** → Ouvre le modal avec données pré-remplies
6. **User Submit Edit** → `updateMutation.mutate()` → API PUT → Success Toast → Cache invalidation → Table refresh
7. **User Click Delete** → Confirmation → `deleteMutation.mutate()` → API DELETE → Success Toast → Cache invalidation → Table refresh

### Features Implémentées

✅ **Create** - Modal avec formulaire validé  
✅ **Read** - Tableau avec tri, pagination, recherche  
✅ **Update** - Modal pré-rempli avec édition  
✅ **Delete** - Suppression avec confirmation  
✅ **Loading States** - Indicateurs de chargement  
✅ **Error Handling** - Messages d'erreur toast  
✅ **Cache Management** - Invalidation automatique  
✅ **Optimistic Updates** - (Optionnel, peut être ajouté)

---

## 🔧 Bonnes Pratiques

### 1. Query Keys

Utilisez des clés de requête cohérentes :

```typescript
queryKey: ["business-types"]           // Liste
queryKey: ["business-types", id]       // Single
queryKey: ["business-types", "search", term] // Search
```

### 2. Error Handling

```typescript
onError: (error: any) => {
  toast.error(
    error.response?.data?.message || 
    error.response?.data?.error || 
    "An error occurred"
  );
}
```

### 3. Loading States

```typescript
const { data, isLoading, isError } = useBusinessTypes();
const { isPending } = useCreateBusinessType();
```

### 4. Cache Invalidation

```typescript
queryClient.invalidateQueries({ queryKey: ["business-types"] });
```

### 5. Optimistic Updates (Optionnel)

```typescript
onMutate: async (newItem) => {
  await queryClient.cancelQueries({ queryKey: ["business-types"] });
  const previous = queryClient.getQueryData(["business-types"]);
  queryClient.setQueryData(["business-types"], (old) => [...old, newItem]);
  return { previous };
},
onError: (err, newItem, context) => {
  queryClient.setQueryData(["business-types"], context.previous);
},
```

---

## 🐛 Debugging

### React Query DevTools

Les DevTools sont intégrés dans `QueryProvider`. Appuyez sur `Ctrl+Shift+D` (ou `Cmd+Shift+D` sur Mac) pour les ouvrir.

### Vérifier les Requêtes

1. Ouvrez les DevTools du navigateur
2. Onglet Network
3. Filtrez par "business-types"
4. Vérifiez les requêtes et réponses

### Logs Console

```typescript
// Dans les hooks
console.log("Query data:", data);
console.log("Mutation error:", error);
```

---

## 📚 Ressources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Table Docs](https://tanstack.com/table/latest)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)

---

## ✅ Checklist de Mise en Place

- [ ] Packages installés
- [ ] QueryProvider configuré dans layout
- [ ] Axios configuré avec baseURL
- [ ] Hooks TanStack Query créés
- [ ] Formulaire avec React Hook Form + Zod
- [ ] Tableau React Table créé
- [ ] Modal créé
- [ ] Intégration dans la page
- [ ] Tests des endpoints API
- [ ] Gestion des erreurs
- [ ] Loading states
- [ ] Notifications toast

---

**Auteur** : Équipe Dolci Rêva  
**Date** : 2024  
**Version** : 1.0.0

