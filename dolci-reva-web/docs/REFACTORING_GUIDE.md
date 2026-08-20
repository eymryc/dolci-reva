# 🔧 Guide de Refactorisation - Dolci Reva

## 🎯 Objectif
Guide pratique pour refactoriser le projet selon les principes SOLID et les bonnes pratiques React.

---

## 📋 Table des Matières

1. [Refactorisation des Composants Volumineux](#1-refactorisation-des-composants-volumineux)
2. [Création d'une Couche Service](#2-création-dune-couche-service)
3. [Séparation Logique/Présentation](#3-séparation-logiqueprésentation)
4. [Composants Génériques](#4-composants-génériques)
5. [Optimisation des Performances](#5-optimisation-des-performances)

---

## 1. Refactorisation des Composants Volumineux

### Exemple : `app/admin/users/[id]/page.tsx` (1201 lignes)

#### ❌ AVANT

```typescript
// app/admin/users/[id]/page.tsx (1201 lignes)
export default function UserDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const userId = Number(params.id);
  
  // 50+ lignes de useState
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  // ... 20+ autres states
  
  // 100+ lignes de logique
  const handleEdit = () => { /* ... */ };
  const handleSave = () => { /* ... */ };
  const handleDelete = () => { /* ... */ };
  // ... 30+ autres handlers
  
  // 1000+ lignes de JSX
  return (
    <div>
      {/* Header */}
      {/* Tabs */}
      {/* User Info */}
      {/* Bookings */}
      {/* Verifications */}
      {/* Documents */}
      {/* Actions */}
    </div>
  );
}
```

#### ✅ APRÈS

```typescript
// app/admin/users/[id]/page.tsx (50 lignes)
import { UserDetailLayout } from '@/components/admin/users/UserDetailLayout';
import { UserInfoSection } from '@/components/admin/users/UserInfoSection';
import { UserBookingsSection } from '@/components/admin/users/UserBookingsSection';
import { UserVerificationSection } from '@/components/admin/users/UserVerificationSection';
import { UserActionsSection } from '@/components/admin/users/UserActionsSection';
import { useUserDetail } from '@/hooks/features/users/use-user-detail';

export default function UserDetailPage() {
  const params = useParams();
  const userId = Number(params.id);
  const { user, isLoading } = useUserDetail(userId);
  
  if (isLoading) return <UserDetailSkeleton />;
  if (!user) return <UserNotFound />;
  
  return (
    <UserDetailLayout>
      <UserInfoSection user={user} />
      <UserBookingsSection userId={userId} />
      <UserVerificationSection userId={userId} />
      <UserActionsSection userId={userId} />
    </UserDetailLayout>
  );
}
```

#### Structure Recommandée

```
components/admin/users/
├── UserDetailLayout.tsx          # Layout avec tabs
├── UserInfoSection.tsx           # Section informations
├── UserBookingsSection.tsx       # Section réservations
├── UserVerificationSection.tsx   # Section vérification
├── UserActionsSection.tsx        # Section actions
├── UserDetailSkeleton.tsx        # Loading state
└── UserNotFound.tsx              # Error state

hooks/features/users/
├── use-user-detail.ts            # Hook pour récupérer les données
├── use-user-bookings.ts          # Hook pour les réservations
└── use-user-verifications.ts     # Hook pour les vérifications
```

---

## 2. Création d'une Couche Service

### Exemple : Service User

#### ❌ AVANT

```typescript
// hooks/use-users.ts
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data.data;
    }
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await api.post('/users', data);
      return response.data.data;
    }
  });
}
```

#### ✅ APRÈS

```typescript
// services/user.service.ts
import api from '@/lib/axios';
import {
  ApiResponse,
  PaginatedApiResponse,
  SingleDataApiResponse,
  extractApiData,
} from '@/types/api-response.types';
import type { User, UserFormData } from '@/types/entities/user.types';

export class UserService {
  /**
   * Récupère tous les utilisateurs avec pagination
   */
  async getAll(page: number = 1): Promise<PaginatedApiResponse<User>> {
    const response = await api.get<PaginatedApiResponse<User>>('/users', {
      params: { page },
    });
    return response.data;
  }

  /**
   * Récupère un utilisateur par ID
   */
  async getById(id: number): Promise<User> {
    const response = await api.get<SingleDataApiResponse<User>>(`/users/${id}`);
    const user = extractApiData<User>(response.data);
    if (!user) throw new Error('User not found');
    return user;
  }

  /**
   * Crée un nouvel utilisateur
   */
  async create(data: UserFormData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    const user = extractApiData<User>(response.data);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  /**
   * Met à jour un utilisateur
   */
  async update(id: number, data: Partial<UserFormData>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    const user = extractApiData<User>(response.data);
    if (!user) throw new Error('Failed to update user');
    return user;
  }

  /**
   * Supprime un utilisateur
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }
}

// Instance singleton
export const userService = new UserService();
```

```typescript
// hooks/features/users/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { handleError } from '@/lib/error-handler';
import { toast } from 'sonner';

export function useUsers(page: number = 1) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => userService.getAll(page),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserFormData) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur créé avec succès !');
    },
    onError: (error) => {
      handleError(error, { defaultMessage: "Échec de la création de l'utilisateur" });
    },
  });
}
```

---

## 3. Séparation Logique/Présentation

### Exemple : Page de Réservation

#### ❌ AVANT

```typescript
// app/(front-office)/residences/[id]/page.tsx (1075 lignes)
export default function ResidenceDetailPage() {
  const params = useParams();
  const residenceId = Number(params.id);
  
  // Logique métier dans le composant
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  
  const handleBook = async () => {
    setIsBooking(true);
    try {
      const response = await api.post(`/residences/${residenceId}/book`, {
        start_date: selectedDates.start,
        end_date: selectedDates.end,
        guests,
      });
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      toast.error('Erreur lors de la réservation');
    } finally {
      setIsBooking(false);
    }
  };
  
  // 1000+ lignes de JSX
  return <div>{/* ... */}</div>;
}
```

#### ✅ APRÈS

```typescript
// hooks/features/reservations/use-reservation-booking.ts
export function useReservationBooking(residenceId: number) {
  const [selectedDates, setSelectedDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [guests, setGuests] = useState(1);
  
  const bookMutation = useBookResidence();
  
  const handleBook = useCallback(async () => {
    if (!selectedDates.start || !selectedDates.end) {
      toast.error('Veuillez sélectionner les dates');
      return;
    }
    
    bookMutation.mutate({
      residenceId,
      data: {
        start_date: format(selectedDates.start, 'yyyy-MM-dd'),
        end_date: format(selectedDates.end, 'yyyy-MM-dd'),
        guests,
      },
    });
  }, [selectedDates, guests, residenceId, bookMutation]);
  
  return {
    selectedDates,
    setSelectedDates,
    guests,
    setGuests,
    handleBook,
    isBooking: bookMutation.isPending,
  };
}
```

```typescript
// app/(front-office)/residences/[id]/page.tsx (100 lignes)
import { ResidenceDetailView } from '@/components/features/residences/ResidenceDetailView';
import { useReservationBooking } from '@/hooks/features/reservations/use-reservation-booking';
import { usePublicResidence } from '@/hooks/use-residences';

export default function ResidenceDetailPage() {
  const params = useParams();
  const residenceId = Number(params.id);
  
  const { data: residence, isLoading } = usePublicResidence(residenceId);
  const booking = useReservationBooking(residenceId);
  
  if (isLoading) return <ResidenceDetailSkeleton />;
  if (!residence) return <ResidenceNotFound />;
  
  return (
    <ResidenceDetailView
      residence={residence}
      booking={booking}
    />
  );
}
```

---

## 4. Composants Génériques

### Exemple : StatusBadge Configurable

#### ❌ AVANT

```typescript
// Duplication dans plusieurs fichiers
const getStatusBadge = (status: string) => {
  if (status === 'PENDING') return <Badge>En attente</Badge>;
  if (status === 'CONFIRMED') return <Badge>Confirmée</Badge>;
  // ...
};
```

#### ✅ APRÈS

```typescript
// components/shared/StatusBadge.tsx
interface StatusConfig {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

interface StatusBadgeProps {
  status: string;
  configs: Record<string, StatusConfig>;
  defaultConfig?: StatusConfig;
}

export function StatusBadge({
  status,
  configs,
  defaultConfig = { label: status, variant: 'default' },
}: StatusBadgeProps) {
  const config = configs[status] || defaultConfig;
  
  return (
    <Badge variant={config.variant}>
      {config.icon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
}
```

```typescript
// constants/status-configs.ts
export const VISIT_STATUS_CONFIGS: Record<string, StatusConfig> = {
  PENDING: {
    label: 'En attente',
    variant: 'warning',
    icon: <Clock className="w-3 h-3" />,
  },
  CONFIRMED: {
    label: 'Confirmée',
    variant: 'success',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  // ...
};

// Usage
<StatusBadge status={visit.status} configs={VISIT_STATUS_CONFIGS} />
```

---

## 5. Optimisation des Performances

### Exemple : Mémorisation et Code Splitting

#### ❌ AVANT

```typescript
export function UserList({ users }: { users: User[] }) {
  const filteredUsers = users.filter(u => u.isActive);
  const sortedUsers = filteredUsers.sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  // Recalculé à chaque render
  
  return (
    <div>
      {sortedUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

#### ✅ APRÈS

```typescript
// Mémorisation
export function UserList({ users }: { users: User[] }) {
  const filteredUsers = useMemo(
    () => users.filter(u => u.isActive),
    [users]
  );
  
  const sortedUsers = useMemo(
    () => [...filteredUsers].sort((a, b) => 
      a.name.localeCompare(b.name)
    ),
    [filteredUsers]
  );
  
  return (
    <div>
      {sortedUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// Code Splitting
const UserDetailModal = lazy(() => 
  import('@/components/admin/users/UserDetailModal')
);

export function UserList() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  return (
    <>
      {/* List */}
      {selectedUser && (
        <Suspense fallback={<ModalSkeleton />}>
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        </Suspense>
      )}
    </>
  );
}
```

---

## 📁 Structure Recommandée Finale

```
src/
├── app/                          # Next.js App Router
│   └── [routes]/
│       └── page.tsx             # Pages légères (< 100 lignes)
│
├── components/
│   ├── features/                # Composants par feature
│   │   ├── users/
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── UserTable.tsx
│   │   └── residences/
│   ├── shared/                  # Composants partagés
│   │   ├── DataTable.tsx
│   │   ├── StatusBadge.tsx
│   │   └── FormBuilder.tsx
│   └── ui/                      # Composants UI de base
│
├── hooks/
│   ├── features/               # Hooks par feature
│   │   ├── users/
│   │   │   ├── use-user-detail.ts
│   │   │   └── use-user-bookings.ts
│   │   └── reservations/
│   └── shared/                  # Hooks partagés
│
├── services/                    # Couche service
│   ├── user.service.ts
│   ├── booking.service.ts
│   └── api.service.ts          # Service API de base
│
├── lib/
│   ├── api/                    # Configuration API
│   │   ├── client.ts
│   │   └── interceptors.ts
│   └── utils/                  # Utilitaires
│
├── types/
│   ├── api/                    # Types API
│   ├── entities/              # Types d'entités
│   └── common.ts              # Types communs
│
└── constants/                  # Constantes
    ├── status-configs.ts
    └── routes.ts
```

---

## 🎯 Checklist de Refactorisation

### Phase 1 - Composants Volumineux
- [ ] `app/admin/users/[id]/page.tsx` → Diviser en 5+ sous-composants
- [ ] `app/(front-office)/residences/[id]/page.tsx` → Extraire logique dans hooks
- [ ] `app/admin/profile/page.tsx` → Séparer en sections
- [ ] `app/auth/sign-up/page.tsx` → Extraire formulaire
- [ ] `app/customer/profile/page.tsx` → Diviser en sections
- [ ] `app/admin/layout.tsx` → Extraire navigation et header

### Phase 2 - Services
- [ ] Créer `services/user.service.ts`
- [ ] Créer `services/booking.service.ts`
- [ ] Créer `services/residence.service.ts`
- [ ] Créer `services/dwelling.service.ts`
- [ ] Mettre à jour tous les hooks pour utiliser les services

### Phase 3 - Composants Génériques
- [ ] Créer `StatusBadge` configurable
- [ ] Créer `FormBuilder` générique
- [ ] Créer `Modal` générique avec variants
- [ ] Créer `Section` composant réutilisable

### Phase 4 - Performance
- [ ] Ajouter `useMemo` dans les composants de liste
- [ ] Ajouter `useCallback` pour les handlers
- [ ] Implémenter lazy loading pour les modals
- [ ] Code splitting par route

---

## 📚 Ressources

- [React Best Practices](https://react.dev/learn)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)






