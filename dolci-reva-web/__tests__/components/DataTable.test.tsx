/**
 * Tests unitaires pour le composant DataTable
 */

import { render, screen } from '@testing-library/react'
import { DataTable } from '@/components/admin/shared/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

interface TestData {
  id: number
  name: string
  email: string
}

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
]

const testData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
]

describe('DataTable', () => {
  it('should render table with data', () => {
    render(<DataTable data={testData} columns={columns} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('should display empty message when no data', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="Aucune donnée" />)

    expect(screen.getByText('Aucune donnée')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    render(<DataTable data={[]} columns={columns} isLoading={true} />)

    // Le loader devrait être présent
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})

