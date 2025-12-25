'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '@/lib/api'

interface Admin {
  id: string
  username: string
  name: string
}

interface AuthContextType {
  admin: Admin | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await authAPI.getMe()
      setAdmin(response.data.admin)
    } catch (error) {
      setAdmin(null)
    }
    setIsLoading(false)
  }

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await authAPI.login({ username, password })
      console.log('Auth API response:', response)
      setAdmin(response.data.admin)
    } catch (error) {
      console.error('Auth API error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authAPI.logout()
    setAdmin(null)
  }

  useEffect(() => {
    // Don't check auth on admin login page to prevent loops
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('admin') === 'true') {
        setIsLoading(false)
        return
      }
    }
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}