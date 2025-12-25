import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/hooks/use-auth'
import HomePage from '@/app/page'

// Mock API calls
jest.mock('@/lib/api', () => ({
  expensesAPI: {
    getAnalytics: jest.fn(() => Promise.resolve({
      data: { summary: [{ _id: 'expense', total: 1000 }, { _id: 'income', total: 2000 }] }
    }))
  },
  billsAPI: {
    getAll: jest.fn(() => Promise.resolve({ data: [] }))
  },
  groceriesAPI: {
    getAll: jest.fn(() => Promise.resolve({ data: [] }))
  }
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/',
}))

const MockedHomePage = () => (
  <AuthProvider>
    <HomePage />
  </AuthProvider>
)

describe('Dashboard Page', () => {
  test('renders dashboard title', async () => {
    render(<MockedHomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Family Dashboard')).toBeInTheDocument()
    })
  })

  test('displays expense and income cards', async () => {
    render(<MockedHomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Expenses')).toBeInTheDocument()
      expect(screen.getByText('Monthly Income')).toBeInTheDocument()
    })
  })

  test('shows meal cards for normal users', async () => {
    render(<MockedHomePage />)
    
    await waitFor(() => {
      expect(screen.getByText("Today's Lunch")).toBeInTheDocument()
      expect(screen.getByText("Today's Dinner")).toBeInTheDocument()
    })
  })
})