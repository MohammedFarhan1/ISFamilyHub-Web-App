'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowLeft, PieChart, Filter, BarChart, LineChart } from 'lucide-react'
import Layout from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { expensesAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart as RechartsLineChart, Line, Area, AreaChart, Pie } from 'recharts'

export default function AnalyticsPage() {
  const [detailedAnalytics, setDetailedAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState('pie')
  const [timePeriod, setTimePeriod] = useState('month')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000']

  useEffect(() => {
    fetchDetailedAnalytics()
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
      
      // Monthly trend data
      const monthlyTrend = allExpenses.reduce((acc: any, exp: any) => {
        const month = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        if (!acc[month]) acc[month] = { month, income: 0, expense: 0 }
        if (exp.type === 'income') acc[month].income += exp.amount
        else acc[month].expense += exp.amount
        return acc
      }, {})
      
      setDetailedAnalytics({
        weekly: weeklyRes.data,
        monthly: monthlyRes.data,
        daily: dailyTotal,
        categoryBreakdown: Object.entries(categoryBreakdown)
          .map(([category, amount]) => ({ category, amount, name: category, value: amount }))
          .sort((a: any, b: any) => b.amount - a.amount),
        monthlyTrend: Object.values(monthlyTrend).slice(-6)
      })
    } catch (error: any) {
      console.error('Failed to fetch detailed analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <Link href="/expenses" className="absolute top-1/2 right-4 -translate-y-1/2">
              <Button variant="outline" size="sm" className="shadow-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-3 pr-20">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Financial Analytics & Charts
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive financial insights and trends</p>
              </div>
            </div>
          </div>
        </div>

        {detailedAnalytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              <Card className="p-3 sm:p-4">
                <CardHeader className="pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1 sm:gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Daily Total</span>
                    <span className="sm:hidden">Daily</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {formatCurrency(Math.abs(detailedAnalytics.daily))}
                  </div>
                  <p className="text-xs text-gray-500">Today's net</p>
                </CardContent>
              </Card>
              
              <Card className="p-3 sm:p-4">
                <CardHeader className="pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1 sm:gap-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Weekly Total</span>
                    <span className="sm:hidden">Weekly</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {formatCurrency(detailedAnalytics.weekly.summary?.find((s: any) => s._id === 'expense')?.total || 0)}
                  </div>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </CardContent>
              </Card>
              
              <Card className="p-3 sm:p-4">
                <CardHeader className="pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1 sm:gap-2">
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Monthly Total</span>
                    <span className="sm:hidden">Monthly</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">
                    {formatCurrency(detailedAnalytics.monthly.summary?.find((s: any) => s._id === 'expense')?.total || 0)}
                  </div>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </CardContent>
              </Card>
              
              <Card className="p-3 sm:p-4">
                <CardHeader className="pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1 sm:gap-2">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Income vs Expense</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-xs sm:text-sm space-y-1">
                    <div className="text-green-600 font-semibold">
                      +{formatCurrency(detailedAnalytics.monthly.summary?.find((s: any) => s._id === 'income')?.total || 0)}
                    </div>
                    <div className="text-red-600 font-semibold">
                      -{formatCurrency(detailedAnalytics.monthly.summary?.find((s: any) => s._id === 'expense')?.total || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Filters */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="floating-card">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Chart Filters:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger className="w-28 sm:w-32 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pie">📊 Pie</SelectItem>
                          <SelectItem value="donut">🍩 Donut</SelectItem>
                          <SelectItem value="bar">📈 Bar</SelectItem>
                          <SelectItem value="line">📉 Line</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={timePeriod} onValueChange={setTimePeriod}>
                        <SelectTrigger className="w-20 sm:w-28 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-24 sm:w-32 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {detailedAnalytics?.categoryBreakdown.slice(0, 5).map((cat: any) => (
                            <SelectItem key={cat.category} value={cat.category}>{cat.category.slice(0, 8)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interactive Charts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="floating-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {chartType === 'pie' && <PieChart className="h-5 w-5 text-purple-600" />}
                    {chartType === 'donut' && <PieChart className="h-5 w-5 text-pink-600" />}
                    {chartType === 'bar' && <BarChart className="h-5 w-5 text-blue-600" />}
                    {chartType === 'line' && <LineChart className="h-5 w-5 text-green-600" />}
                    Financial Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'pie' ? (
                        <RechartsPieChart>
                          <Pie
                            data={detailedAnalytics?.categoryBreakdown.slice(0, 6)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1000}
                          >
                            {detailedAnalytics?.categoryBreakdown.slice(0, 6).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </RechartsPieChart>
                      ) : chartType === 'donut' ? (
                        <RechartsPieChart>
                          <Pie
                            data={detailedAnalytics?.categoryBreakdown.slice(0, 6)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
                            innerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 30 : 40}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1000}
                          >
                            {detailedAnalytics?.categoryBreakdown.slice(0, 6).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </RechartsPieChart>
                      ) : chartType === 'bar' ? (
                        <RechartsBarChart data={detailedAnalytics?.categoryBreakdown.slice(0, 8)} margin={{ bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="category" 
                            angle={-45} 
                            textAnchor="end" 
                            height={80}
                            fontSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12}
                            interval={0}
                          />
                          <YAxis tickFormatter={(value) => `$${value}`} fontSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="amount" fill="#8884d8" animationDuration={1000}>
                            {detailedAnalytics?.categoryBreakdown.slice(0, 8).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      ) : (
                        <RechartsLineChart data={detailedAnalytics?.monthlyTrend} margin={{ bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" fontSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12} />
                          <YAxis tickFormatter={(value) => `$${value}`} fontSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend wrapperStyle={{ fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? '10px' : '12px' }} />
                          <Line type="monotone" dataKey="income" stroke="#82ca9d" strokeWidth={typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3} animationDuration={1000} />
                          <Line type="monotone" dataKey="expense" stroke="#ff7300" strokeWidth={typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3} animationDuration={1000} />
                        </RechartsLineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg font-semibold">Top Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {detailedAnalytics.categoryBreakdown.slice(0, 8).map((item: any, index: number) => (
                      <motion.div 
                        key={item.category} 
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0`} 
                               style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-medium text-sm sm:text-base truncate">{item.category}</span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                          <div className="w-16 sm:w-32 bg-gray-200 rounded-full h-1.5 sm:h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 sm:h-2 rounded-full"
                              style={{ 
                                width: `${(item.amount / detailedAnalytics.categoryBreakdown[0].amount) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="font-bold text-gray-800 text-xs sm:text-sm min-w-[60px] sm:min-w-[80px] text-right">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Financial Insights */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Financial Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Highest Expense Category</h4>
                      <p className="text-blue-700">
                        {detailedAnalytics.categoryBreakdown[0]?.category || 'No data'} - {formatCurrency(detailedAnalytics.categoryBreakdown[0]?.amount || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Monthly Trend</h4>
                      <p className="text-green-700">
                        {(detailedAnalytics.monthly.summary?.find((s: any) => s._id === 'income')?.total || 0) > 
                         (detailedAnalytics.monthly.summary?.find((s: any) => s._id === 'expense')?.total || 0) 
                         ? 'Positive' : 'Negative'} cash flow this month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-50 rounded-2xl w-fit mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400 mx-auto" />
            </div>
            <p className="text-gray-500 font-medium">No financial data available</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
