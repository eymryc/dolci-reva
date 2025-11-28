# Guide de Tests

## Structure des Tests

Les tests sont organisés dans le dossier `__tests__/` avec la même structure que le code source.

## Installation

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

## Configuration

- `jest.config.js` - Configuration principale de Jest
- `jest.setup.js` - Configuration de setup pour les tests

## Exécution des Tests

```bash
# Exécuter tous les tests
npm test

# Exécuter en mode watch
npm test -- --watch

# Exécuter avec couverture
npm test -- --coverage
```

## Exemples de Tests

### Test de Hook

```typescript
import { renderHook } from '@testing-library/react'
import { useWalletTransactions } from '@/hooks/use-wallet'

test('should fetch transactions', async () => {
  const { result } = renderHook(() => useWalletTransactions(1))
  // ...
})
```

### Test de Composant

```typescript
import { render, screen } from '@testing-library/react'
import { DataTable } from '@/components/admin/shared/DataTable'

test('should render table', () => {
  render(<DataTable data={[]} columns={[]} />)
  // ...
})
```

## Bonnes Pratiques

1. **Nommage** : Utiliser des noms descriptifs (`should render table with data`)
2. **Isolation** : Chaque test doit être indépendant
3. **Mocking** : Mocker les dépendances externes (API, router, etc.)
4. **Coverage** : Viser au moins 80% de couverture pour les composants critiques

