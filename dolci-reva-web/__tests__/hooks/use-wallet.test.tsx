/**
 * Tests unitaires pour le hook use-wallet
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWalletTransactions, TransactionCategory } from '@/hooks/use-wallet'
import api from '@/lib/axios'

// Mock de l'API
jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useWalletTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch transactions with default parameters', async () => {
    const mockedGet = api.get as jest.Mock
    mockedGet.mockResolvedValue({
      data: {
        data: [],
        meta: { current_page: 1, last_page: 1 },
      },
    })

    const { result } = renderHook(
      () => useWalletTransactions(1, TransactionCategory.BOOKING),
      { wrapper: Wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockedGet).toHaveBeenCalledWith('/wallet_transactions', {
      params: { page: 1, transaction_category: TransactionCategory.BOOKING },
    })
  })
})

