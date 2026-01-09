'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Calendar, Filter } from 'lucide-react'
import Layout from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { expensesAPI } from '@/lib/api'

export default function ExportPage() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    category: 'all',
    paymentMethod: 'all'
  })
  const [isExporting, setIsExporting] = useState(false)

  const categories = [
    'Food & Dining', 'Groceries', 'Transportation', 'Utilities', 
    'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Bills', 'Other'
  ]

  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet']

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true)
    try {
      // Get filtered transactions
      const params: any = {}
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.type !== 'all') params.type = filters.type
      if (filters.category !== 'all') params.category = filters.category
      if (filters.paymentMethod !== 'all') params.paymentMethod = filters.paymentMethod

      const response = await expensesAPI.getAll(params)
      const transactions = response.data.expenses || []

      if (format === 'pdf') {
        exportToPDF(transactions)
      } else {
        exportToExcel(transactions)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions to export')
      return
    }

    // Calculate totals
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const netBalance = totalIncome - totalExpenses

    // Simple PDF export using browser print
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to export PDF')
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
            .summary-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
            .income { color: #16a34a; }
            .expense { color: #dc2626; }
            .balance { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>ISFamilyHub - Transaction Export</h1>
          <p>Export Date: ${new Date().toLocaleDateString()}</p>
          <p>Date Range: ${filters.startDate || 'All'} - ${filters.endDate || 'All'}</p>
          
          <div class="summary">
            <h3>Financial Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Monthly Income</div>
                <div class="summary-value income">₹${totalIncome.toLocaleString()}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Monthly Expenses</div>
                <div class="summary-value expense">₹${totalExpenses.toLocaleString()}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Net Balance</div>
                <div class="summary-value balance">₹${netBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => {
                const title = (t.title || 'Untitled Transaction').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                return `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${title}</td>
                  <td class="${t.type}">${t.type}</td>
                  <td>${t.category}</td>
                  <td class="${t.type}">₹${t.amount.toLocaleString()}</td>
                  <td>${t.paymentMethod}</td>
                </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  const exportToExcel = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions to export')
      return
    }

    try {
      // Calculate totals
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      const netBalance = totalIncome - totalExpenses

      // CSV export with summary
      const summaryRows = [
        ['ISFamilyHub - Financial Summary'],
        ['Export Date', new Date().toLocaleDateString()],
        ['Date Range', `${filters.startDate || 'All'} - ${filters.endDate || 'All'}`],
        [''],
        ['Financial Summary'],
        ['Monthly Income', `₹${totalIncome.toLocaleString()}`],
        ['Monthly Expenses', `₹${totalExpenses.toLocaleString()}`],
        ['Net Balance', `₹${netBalance.toLocaleString()}`],
        [''],
        ['Transaction Details']
      ]
      
      const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method']
      const transactionRows = transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        (t.title || 'Untitled Transaction').replace(/"/g, '""'),
        t.type,
        t.category,
        t.amount,
        t.paymentMethod
      ])
      
      const csvContent = [
        ...summaryRows.map(row => row.map(field => `"${field}"`).join(',')),
        headers.join(','),
        ...transactionRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Excel export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Export Transactions</h1>
          <p className="text-gray-600">Export your transaction history as PDF or Excel files</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Export Filters
            </CardTitle>
            <CardDescription>
              Configure what data to include in your export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="expense">Expenses Only</SelectItem>
                    <SelectItem value="income">Income Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payment Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  {paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <Button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="w-full h-auto p-6 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="h-8 w-8" />
                    <div className="text-lg font-semibold">Export as PDF</div>
                    <div className="text-sm opacity-90">Formatted document for printing</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <Button
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                  className="w-full h-auto p-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Download className="h-8 w-8" />
                    <div className="text-lg font-semibold">Export as Excel</div>
                    <div className="text-sm opacity-90">Spreadsheet for data analysis</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {isExporting && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <span>Preparing export...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}