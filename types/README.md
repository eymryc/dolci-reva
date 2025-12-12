# Types TypeScript pour l'API Dolci Reva

Ce dossier contient les types TypeScript adaptés selon les retours réels de l'API Laravel.

## 📁 Fichiers

- **`api-response.types.ts`** : Types de base pour toutes les réponses API
- **`api-response.example.ts`** : Exemples d'utilisation de chaque type
- **`api-response.hooks.ts`** : Hooks React pour faciliter l'utilisation
- **`README.md`** : Cette documentation

## 🎯 Structures de Réponses Identifiées

L'API utilise différentes structures selon le contexte :

### 1. Réponses avec `status`, `success`, `message`, `data`
```typescript
{
  status: 201,
  success: true,
  message: "Account created successfully",
  data: { id: 1, email: "user@example.com" }
}
```
**Type** : `ApiResponse<T>`  
**Utilisée pour** : POST /users, POST /wallets, etc.

### 2. Réponses avec seulement `success` et `data`
```typescript
{
  success: true,
  data: [...]
}
```
**Type** : `SimpleApiResponse<T>`  
**Utilisée pour** : GET /messages/conversations, GET /favorites, etc.

### 3. Réponses avec `success`, `message`, `data` (sans `status`)
```typescript
{
  success: true,
  message: "Catégorie créée avec succès",
  data: { id: 1, name: "Entrées" }
}
```
**Type** : `ApiResponseWithMessage<T>`  
**Utilisée pour** : POST /menu-categories, POST /lounge-product-categories, etc.

### 4. Réponses paginées (Laravel Resource Collections)
```typescript
{
  data: [...],
  links: { first: "...", last: "...", prev: null, next: "..." },
  meta: { current_page: 1, per_page: 15, total: 75, ... }
}
```
**Type** : `PaginatedApiResponse<T>`  
**Utilisée pour** : GET /users, GET /bookings, GET /wallets, etc.

### 5. Réponses de login
```typescript
{
  success: true,
  status: 200,
  message: "Login successful",
  token: "1|abcdef...",
  type: "Bearer",
  expires_at: "2024-12-06T11:51:00.000000Z",
  remember_me: true,
  user: { id: 1, email: "user@example.com", ... }
}
```
**Type** : `LoginResponse`  
**Utilisée pour** : POST /auth/login

### 6. Réponses d'erreur de validation (422)
```typescript
{
  message: "The given data was invalid.",
  errors: {
    email: ["The email has already been taken."],
    password: ["The password must be at least 8 characters."]
  }
}
```
**Type** : `ValidationErrorResponse`  
**Utilisée pour** : Erreurs de validation Laravel

### 7. Réponses d'erreur standard
```typescript
{
  status: 401,
  success: false,
  message: "These credentials do not match our records."
}
```
**Type** : `ApiErrorResponse`  
**Utilisée pour** : Erreurs 400, 401, 403, 500, etc.

## 📖 Utilisation

### Import des types
```typescript
import type {
  ApiResponse,
  PaginatedApiResponse,
  SimpleApiResponse,
  LoginResponse,
  ValidationErrorResponse,
} from '@/types/api-response.types';
```

### Utilisation dans les composants
```typescript
import { useApiResponse } from '@/types/api-response.hooks';

function MyComponent() {
  const { extractData, getMessage, isError } = useApiResponse();

  const fetchData = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();

    if (isError(data)) {
      const message = getMessage(data);
      console.error(message);
      return;
    }

    const users = extractData<User[]>(data);
    // users est typé correctement
  };
}
```

### Utilisation avec fetch
```typescript
async function fetchUsers(): Promise<PaginatedApiResponse<User>> {
  const response = await fetch('/api/users');
  return response.json();
}
```

### Utilisation avec axios
```typescript
import axios from 'axios';
import type { ApiResponse } from '@/types/api-response.types';

async function createUser(data: UserInput): Promise<ApiResponse<User>> {
  const response = await axios.post<ApiResponse<User>>('/api/users', data);
  return response.data;
}
```

## 🔧 Helpers Disponibles

### `isApiError(response)`
Vérifie si une réponse est une erreur.

### `isPaginatedResponse(response)`
Vérifie si une réponse est paginée.

### `isApiResponseWithData(response)`
Vérifie si une réponse contient des données.

### `extractApiData(response)`
Extrait les données d'une réponse, peu importe le format.

### `extractApiMessage(response)`
Extrait le message d'une réponse.

### `extractValidationErrors(response)`
Extrait les erreurs de validation d'une réponse.

## 📝 Notes

- Les types sont adaptés selon les retours **réels** de l'API
- Certaines réponses peuvent varier légèrement selon le contexte
- Utilisez les type guards pour vérifier le format avant d'utiliser les données
- Les helpers facilitent l'extraction des données peu importe le format

## 🔄 Mise à Jour

Si l'API change de structure, mettez à jour les types dans `api-response.types.ts`
et les exemples dans `api-response.example.ts`.

