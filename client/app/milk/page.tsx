'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Milk, History, TrendingUp, X } from 'lucide-react'
import Layout from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { milkAPI } from '@/lib/api'
import { formatDate } from '@/lib/utils'

const QUANTITY_OPTIONS = [
  { ml: 250, price: 12.50, label: '250 ml' },
  { ml: 500, price: 25.00, label: '500 ml' },
  { ml: 750, price: 37.50, label: '750 ml' },
  { ml: 1000, price: 50.00, label: '1 Liter' },
  { ml: 1500, price: 75.00, label: '1.5 Liters' }
]

export default function MilkCalcPage() {
  const { admin } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [todayEntry, setTodayEntry] = useState<any>(null)
  const [currentCycle, setCurrentCycle] = useState<any>(null)
  const [history, setHistory] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [loading, setLoading] = useState(true)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [customQuantity, setCustomQuantity] = useState('')

  useEffect(() => {
    fetchTodayEntry()
    fetchCurrentCycle()
    
    // Auto-refresh for normal users
    if (!admin) {
      const interval = setInterval(() => {
        fetchTodayEntry()
        fetchCurrentCycle()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedDate, admin])

  const fetchTodayEntry = async () => {
    try {
      const response = await milkAPI.getByDate(selectedDate)
      setTodayEntry(response.data)
    } catch (error) {
      setTodayEntry(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentCycle = async () => {
    try {
      const response = await milkAPI.getCurrentCycle()
      setCurrentCycle(response.data)
    } catch (error) {
      console.error('Failed to fetch current cycle:', error)
    }
  }

  const fetchHistory = async (year: number, month: number) => {
    try {
      const response = await milkAPI.getHistory(year, month)
      setHistory(response.data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    }
  }

  const handleDelete = async () => {
    if (!admin || !todayEntry) return
    
    try {
      await milkAPI.deleteEntry(selectedDate)
      fetchTodayEntry()
      fetchCurrentCycle()
    } catch (error) {
      console.error('Failed to delete milk entry:', error)
    }
  }

  const handleCustomQuantity = async () => {
    if (!admin || !customQuantity) return
    
    const quantity = parseFloat(customQuantity) * 1000 // Convert liters to ml
    
    try {
      await milkAPI.addEntry({
        date: selectedDate,
        quantity: Math.round(quantity)
      })
      setCustomDialogOpen(false)
      setCustomQuantity('')
      fetchTodayEntry()
      fetchCurrentCycle()
    } catch (error) {
      console.error('Failed to add custom milk entry:', error)
    }
  }

  const handleQuantitySelect = async (quantity: number) => {
    if (!admin) return
    
    try {
      await milkAPI.addEntry({
        date: selectedDate,
        quantity
      })
      fetchTodayEntry()
      fetchCurrentCycle()
    } catch (error) {
      console.error('Failed to add milk entry:', error)
    }
  }

  const handleMonthSelect = (monthYear: string) => {
    setSelectedMonth(monthYear)
    if (monthYear) {
      const [year, month] = monthYear.split('-')
      fetchHistory(parseInt(year), parseInt(month))
    } else {
      setHistory(null)
    }
  }

  const generateMonthOptions = () => {
    const options = []
    const now = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    
    return options
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading milk calculator...</p>
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-teal-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                <Milk className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                  Milk Calculator
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Daily Milk Expense Tracker</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="floating-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">
                    Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                {admin && (
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quantity Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Milk className="h-5 w-5 text-blue-600" />
                Select Quantity {!admin && '(Admin Only)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {QUANTITY_OPTIONS.map((option) => (
                  <Button
                    key={option.ml}
                    variant={todayEntry?.quantity === option.ml ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleQuantitySelect(option.ml)}
                    disabled={!admin}
                    className={`h-20 flex flex-col space-y-1 text-center transition-all duration-300 ${
                      todayEntry?.quantity === option.ml 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' 
                        : 'hover:bg-blue-50 hover:border-blue-200 hover:scale-105'
                    } ${!admin ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-lg font-bold">{option.label}</span>
                    <span className="text-sm">₹{option.price}</span>
                  </Button>
                ))}
                
                {/* Custom Quantity Button */}
                <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={!admin}
                      className={`h-20 flex flex-col space-y-1 text-center transition-all duration-300 hover:bg-purple-50 hover:border-purple-200 hover:scale-105 ${!admin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-lg font-bold">Custom</span>
                      <span className="text-sm">Any Amount</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Custom Quantity</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customQty">Enter Quantity (Liters)</Label>
                        <Input
                          id="customQty"
                          type="number"
                          step="0.1"
                          placeholder="e.g. 2.5 or 1.25"
                          value={customQuantity}
                          onChange={(e) => setCustomQuantity(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Price: ₹50 per liter
                        </p>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCustomQuantity} disabled={!customQuantity}>
                          Add Entry
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Milk for Today</CardTitle>
            </CardHeader>
            <CardContent>
              {todayEntry ? (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Quantity: {todayEntry.quantity} ml
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      Amount: ₹{todayEntry.amount}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Milk className="h-12 w-12 text-blue-500" />
                    {admin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Milk className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No milk entry for today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Current Milk Total (This Cycle)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <p className="text-4xl font-bold text-green-600 mb-2">
                  ₹{currentCycle?.total?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-600">
                  {currentCycle?.entryCount || 0} entries this cycle
                </p>
                {currentCycle?.cycleStart && (
                  <p className="text-xs text-gray-500 mt-1">
                    Cycle started: {formatDate(currentCycle.cycleStart)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* History Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedMonth} onValueChange={handleMonthSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {history && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <p className="text-lg font-semibold text-purple-600">
                        Total: ₹{history.total?.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {history.entries?.length > 0 ? (
                        history.entries.map((entry: any, index: number) => (
                          <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">
                                {formatDate(entry.date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{entry.quantity} ml</p>
                              <p className="font-semibold text-gray-800">₹{entry.amount}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No entries found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}