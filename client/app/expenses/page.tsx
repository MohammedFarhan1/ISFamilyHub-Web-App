'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Download, DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, BarChart3, Trash2, RotateCcw } from 'lucide-react'
import Layout from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { expensesAPI } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function ExpensesPage() {
  const { admin } = useAuth()
  const [expenses, setExpenses] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [chartDialogOpen, setChartDialogOpen] = useState<boolean>(false)
  const [detailedAnalytics, setDetailedAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    paymentMethod: '',
    type: 'expense',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchDetailedAnalytics = async () => {
    try {
      const [weeklyRes, monthlyRes, categoryRes] = await Promise.all([
        expensesAPI.getAnalytics({ period: 'week' }),
        expensesAPI.getAnalytics({ period: 'month' }),
        expensesAPI.getAll({ limit: 1000 })
      ])
      
      const allExpenses = categoryRes.data.expenses
      const today = new Date()
      const dailyTotal = allExpenses
        .filter((exp: any) => new Date(exp.date).toDateString() === today.toDateString())
        .reduce((sum: number, exp: any) => sum + (exp.type === 'expense' ? exp.amount : -exp.amount), 0)
      
      const categoryBreakdown = allExpenses.reduce((acc: any, exp: any) => {
        if (exp.type === 'expense') {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        }
        return acc
      }, {})
      
      setDetailedAnalytics({
        weekly: weeklyRes.data,
        monthly: monthlyRes.data,
        daily: dailyTotal,
        categoryBreakdown: Object.entries(categoryBreakdown)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a: any, b: any) => b.amount - a.amount)
      })
    } catch (error: any) {
      console.error('Failed to fetch detailed analytics:', error)
    }
  }

  const handleReset = async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    
    if (confirm(`Reset all expenses and income for ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}? This cannot be undone.`)) {
      try {
        await expensesAPI.reset(year, month)
        fetchData()
      } catch (error: any) {
        console.error('Failed to reset data:', error)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await expensesAPI.delete(id)
      fetchData()
    } catch (error: any) {
      console.error('Failed to delete expense:', error)
    }
  }

  const fetchData = async () => {
    try {
      const [expensesRes, analyticsRes] = await Promise.all([
        expensesAPI.getAll({ limit: 20 }),
        expensesAPI.getAnalytics({ period: 'month' })
      ])
      
      setExpenses(expensesRes.data.expenses)
      setAnalytics(analyticsRes.data)
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await expensesAPI.create({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      setDialogOpen(false)
      setFormData({
        title: '',
        amount: '',
        category: '',
        paymentMethod: '',
        type: 'expense',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchData()
    } catch (error: any) {
      console.error('Failed to create expense:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading financial data...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const totalExpenses = analytics?.summary?.find((s: any) => s._id === 'expense')?.total || 0
  const totalIncome = analytics?.summary?.find((s: any) => s._id === 'income')?.total || 0
  const netBalance = totalIncome - totalExpenses
  
  // Calculate today's spending
  const today = new Date()
  const todaySpending = expenses
    .filter((exp: any) => new Date(exp.date).toDateString() === today.toDateString() && exp.type === 'expense')
    .reduce((sum: number, exp: any) => sum + exp.amount, 0)

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Beautiful Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Expenses & Income
                  </h1>
                  <p className="text-gray-600 mt-1">Track and analyze family finances</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 w-full sm:w-auto"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <Link href="/analytics">View Analytics</Link>
                </Button>
                {admin && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleReset}
                      className="hover:bg-red-50 hover:border-red-200 text-red-600 hover:text-red-700 transition-all duration-300 w-full sm:w-auto"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Month
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span>Add Expense/Income</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-y-auto px-1">
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              placeholder="Name of the expense/income"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Type</Label>
                              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="expense">Expense</SelectItem>
                                  <SelectItem value="income">Income</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</Label>
                            <div className="space-y-2">
                              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                                  <SelectItem value="Groceries">Groceries</SelectItem>
                                  <SelectItem value="Transportation">Transportation</SelectItem>
                                  <SelectItem value="Utilities">Utilities</SelectItem>
                                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                                  <SelectItem value="Shopping">Shopping</SelectItem>
                                  <SelectItem value="Education">Education</SelectItem>
                                  <SelectItem value="Bills">Bills</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Or type new category"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">Payment Method</Label>
                            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Credit Card">Credit Card</SelectItem>
                                <SelectItem value="Debit Card">Debit Card</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Digital Wallet">Digital Wallet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData({...formData, date: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</Label>
                            <Input
                              id="notes"
                              value={formData.notes}
                              onChange={(e) => setFormData({...formData, notes: e.target.value})}
                              placeholder="Add notes..."
                            />
                          </div>
                          <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                              Add Entry
                            </Button>
                          </div>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Monthly Income</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
                  <span className="animate-counter">{formatCurrency(totalIncome)}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Current month income
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Monthly Expenses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-red-600 mb-1">
                  <span className="animate-counter">{formatCurrency(totalExpenses)}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Current month spending
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Today's Spending</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">
                  <span className="animate-counter">{formatCurrency(todaySpending)}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Amount spent today
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="stat-card group cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Net Balance</CardTitle>
                <div className={`p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                  netBalance >= 0 
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                    : 'bg-gradient-to-br from-orange-500 to-red-500'
                }`}>
                  <Wallet className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-lg sm:text-2xl font-bold mb-1 ${
                  netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  <span className="animate-counter">{formatCurrency(netBalance)}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {netBalance >= 0 ? 'Positive balance' : 'Negative balance'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-gray-600">
                Latest income and expense entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-2xl w-fit mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No transactions found. {admin && 'Add your first entry to get started.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense: any, index: number) => (
                    <motion.div
                      key={expense._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 sm:p-3 rounded-xl ${
                          expense.type === 'income' 
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                            : 'bg-gradient-to-br from-red-100 to-pink-100'
                        }`}>
                          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                            expense.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{expense.title}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {expense.category} • {formatDate(expense.date)}
                          </p>
                          <p className="text-xs text-gray-400 sm:hidden">{expense.paymentMethod}</p>
                          {expense.notes && (
                            <p className="text-xs text-gray-600 mt-1 italic hidden sm:block">{expense.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                        <div className="text-right">
                          <div className={`text-sm sm:text-lg font-bold ${
                            expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                          </div>
                          <div className="text-xs text-gray-400 hidden sm:block">{expense.paymentMethod}</div>
                        </div>
                        {admin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}