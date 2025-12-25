'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, FileText, ShoppingCart, Package, AlertCircle, TrendingUp, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import Layout from '@/components/layout'
import AdminLogin from '@/components/admin-login'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { expensesAPI, billsAPI, groceriesAPI, documentsAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function HomePage() {
  const { admin, isLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<{
    monthlyExpenses: number;
    monthlyIncome: number;
    pendingBills: number;
    groceryItems: number;
    todayLunch: string;
    todayDinner: string;
  }>({
    monthlyExpenses: 0,
    monthlyIncome: 0,
    pendingBills: 0,
    groceryItems: 0,
    todayLunch: 'Not planned',
    todayDinner: 'Not planned'
  })
  const [dataLoading, setDataLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [expensesRes, billsRes, groceriesRes] = await Promise.all([
          expensesAPI.getAnalytics({ period: 'month' }),
          billsAPI.getAll(),
          groceriesAPI.getAll({ purchased: false })
        ])

        const expenses = expensesRes.data.summary.find((s: any) => s._id === 'expense')?.total || 0
        const income = expensesRes.data.summary.find((s: any) => s._id === 'income')?.total || 0
        const pendingBills = billsRes.data.filter((bill: any) => !bill.isPaid).length
        const groceryItems = groceriesRes.data.length
        
        setDashboardData({
          monthlyExpenses: expenses,
          monthlyIncome: income,
          pendingBills,
          groceryItems,
          todayLunch: 'Rice & Curry',
          todayDinner: 'Chapati & Sabji'
        })
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading ISFamilyHub...</p>
        </div>
      </div>
    )
  }

  const showAdminLogin = admin === null && !isLoading && typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('admin') === 'true'

  if (showAdminLogin) {
    return <AdminLogin />
  }

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Header with Gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Family Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Welcome to your smart family hub</p>
                </div>
              </div>
              {!admin && (
                <div className="flex justify-center sm:justify-end">
                  <a href="?admin=true" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Admin Login
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid with Beautiful Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Monthly Expenses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
                  {dataLoading ? (
                    <div className="shimmer h-8 w-24 rounded"></div>
                  ) : (
                    <span className="animate-counter">{formatCurrency(dashboardData.monthlyExpenses)}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Current month spending
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Monthly Income</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                  {dataLoading ? (
                    <div className="shimmer h-8 w-24 rounded"></div>
                  ) : (
                    <span className="animate-counter">{formatCurrency(dashboardData.monthlyIncome)}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Current month income
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Pending Bills</CardTitle>
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
                  {dataLoading ? (
                    <div className="shimmer h-8 w-16 rounded"></div>
                  ) : (
                    <span className="animate-counter">{dashboardData.pendingBills}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Bills awaiting payment
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full"
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Grocery Items</CardTitle>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  {dataLoading ? (
                    <div className="shimmer h-8 w-16 rounded"></div>
                  ) : (
                    <span className="animate-counter">{dashboardData.groceryItems}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Items to purchase
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="h-full"
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Today's Lunch</CardTitle>
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-sm font-bold">🍽️</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-amber-600 mb-1">
                  {dataLoading ? (
                    <div className="shimmer h-6 w-20 rounded"></div>
                  ) : (
                    <span>Lunch</span>
                  )}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  {dataLoading ? (
                    <div className="shimmer h-4 w-24 rounded"></div>
                  ) : (
                    dashboardData.todayLunch
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="h-full"
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Today's Dinner</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-sm font-bold">🍽️</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-600 mb-1">
                  {dataLoading ? (
                    <div className="shimmer h-6 w-20 rounded"></div>
                  ) : (
                    <span>Dinner</span>
                  )}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  {dataLoading ? (
                    <div className="shimmer h-4 w-24 rounded"></div>
                  ) : (
                    dashboardData.todayDinner
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions with Modern Design */}
        {admin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="floating-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your family data efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <motion.a 
                    href="/expenses" 
                    className="group p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mx-auto w-fit mb-3 group-hover:shadow-lg transition-all duration-300">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">Add Expense</div>
                  </motion.a>
                  
                  <motion.a 
                    href="/bills" 
                    className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mx-auto w-fit mb-3 group-hover:shadow-lg transition-all duration-300">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">Manage Bills</div>
                  </motion.a>
                  
                  <motion.a 
                    href="/groceries" 
                    className="group p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mx-auto w-fit mb-3 group-hover:shadow-lg transition-all duration-300">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">Update Groceries</div>
                  </motion.a>
                  
                  <motion.a 
                    href="/documents" 
                    className="group p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mx-auto w-fit mb-3 group-hover:shadow-lg transition-all duration-300">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">Upload Document</div>
                  </motion.a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  )
}