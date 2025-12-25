import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/hooks/use-auth'
import GroceriesPage from '@/app/groceries/page'

// Mock API calls
jest.mock('@/lib/api', () => ({
  groceriesAPI: {
    getAll: jest.fn(() => Promise.resolve({
      data: [
        { _id: '1', name: 'Apples', category: 'Fruits & Vegetables', priority: 'high', isPurchased: false },
        { _id: '2', name: 'Milk', category: 'Dairy & Eggs', priority: 'medium', isPurchased: true }
      ]
    })),
    create: jest.fn(() => Promise.resolve({})),
    togglePurchased: jest.fn(() => Promise.resolve({}))
  }
}))

const MockedGroceriesPage = () => (
  <AuthProvider>
    <GroceriesPage />
  </AuthProvider>
)

describe('Groceries Page', () => {
  test('renders grocery list title', async () => {
    render(<MockedGroceriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Grocery List')).toBeInTheDocument()
    })
  })

  test('displays grocery items', async () => {
    render(<MockedGroceriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Apples')).toBeInTheDocument()
      expect(screen.getByText('Milk')).toBeInTheDocument()
    })
  })

  test('shows purchased items count', async () => {
    render(<MockedGroceriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Purchased')).toBeInTheDocument()
    })
  })
})