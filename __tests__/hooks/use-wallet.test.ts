/**
 * Tests unitaires pour le hook use-wallet
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWalletTransactions, TransactionCategory } from '@/hooks/use-wallet'

// Mock de l'API
jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useWalletTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch transactions with default parameters', async () => {
    const api = require('@/lib/axios').default
    api.get.mockResolvedValue({
      data: {
        data: [],
        meta: { current_page: 1, last_page: 1 },
      },
    })

    const { result } = renderHook(
      () => useWalletTransactions(1, TransactionCategory.BOOKING),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(api.get).toHaveBeenCalledWith('/wallet_transactions', {
      params: { page: 1, transaction_category: TransactionCategory.BOOKING },
    })
  })
})

