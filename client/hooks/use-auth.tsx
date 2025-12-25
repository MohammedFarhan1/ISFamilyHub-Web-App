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
  const [authChecked, setAuthChecked] = useState(false)

  const checkAuth = async () => {
    if (authChecked) return // Prevent multiple auth checks
    
    try {
      const response = await authAPI.getMe()
      setAdmin(response.data.admin)
    } catch (error: any) {
      // Only set admin to null if we haven't logged in yet
      if (!admin) {
        setAdmin(null)
      }
    }
    setIsLoading(false)
    setAuthChecked(true)
  }

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await authAPI.login({ username, password })
      console.log('Auth API response:', response)
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.token)
      }
      
      setAdmin(response.data.admin)
      setAuthChecked(true)
    } catch (error) {
      console.error('Auth API error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
    setAdmin(null)
    setAuthChecked(false)
  }

  useEffect(() => {
    // Only check auth once when component mounts
    if (!authChecked) {
      checkAuth()
    }
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