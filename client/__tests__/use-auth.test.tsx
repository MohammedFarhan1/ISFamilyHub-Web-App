import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth, AuthProvider } from '@/hooks/use-auth'

// Mock API calls
jest.mock('@/lib/api', () => ({
  authAPI: {
    login: jest.fn(() => Promise.resolve({
      data: { admin: { id: '1', username: 'Farhan', name: 'Farhan' } }
    })),
    logout: jest.fn(() => Promise.resolve({})),
    getMe: jest.fn(() => Promise.resolve({
      data: { admin: { id: '1', username: 'Farhan', name: 'Farhan' } }
    }))
  }
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth Hook', () => {
  test('initializes with null admin and loading state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.admin).toBeNull()
    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  test('logs in admin successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.login('Farhan', 'password')
    })
    
    expect(result.current.admin).toEqual({
      id: '1',
      username: 'Farhan',
      name: 'Farhan'
    })
  })

  test('logs out admin successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    // First login
    await act(async () => {
      await result.current.login('Farhan', 'password')
    })
    
    // Then logout
    await act(async () => {
      await result.current.logout()
    })
    
    expect(result.current.admin).toBeNull()
  })
})