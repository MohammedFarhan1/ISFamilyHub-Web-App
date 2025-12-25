'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Clock, CheckCircle2, AlertCircle, FileText, CreditCard } from 'lucide-react'
import Layout from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { billsAPI } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function BillsPage() {
  const { admin } = useAuth()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: '',
    isRecurring: true,
    recurringType: 'monthly',
    notes: ''
  })

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const response = await billsAPI.getAll()
      setBills(response.data)
    } catch (error) {
      console.error('Failed to fetch bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePaid = async (id: string) => {
    if (!admin) return
    try {
      await billsAPI.togglePaid(id)
      fetchBills()
    } catch (error) {
      console.error('Failed to toggle bill:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await billsAPI.create({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      setDialogOpen(false)
      setFormData({
        name: '',
        amount: '',
        dueDate: '',
        category: '',
        isRecurring: true,
        recurringType: 'monthly',
        notes: ''
      })
      fetchBills()
    } catch (error) {
      console.error('Failed to create bill:', error)
    }
  }

  const getBillStatus = (bill: any) => {
    if (bill.isPaid) return { status: 'paid', color: 'green', icon: CheckCircle2 }
    if (new Date(bill.dueDate) < new Date()) return { status: 'overdue', color: 'red', icon: AlertCircle }
    return { status: 'pending', color: 'orange', icon: Clock }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading bills...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const paidBills = bills.filter((bill: any) => bill.isPaid).length
  const pendingBills = bills.filter((bill: any) => !bill.isPaid).length
  const overdueBills = bills.filter((bill: any) => !bill.isPaid && new Date(bill.dueDate) < new Date()).length
  
  // Find next bill due
  const upcomingBills = bills
    .filter((bill: any) => !bill.isPaid && new Date(bill.dueDate) >= new Date())
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  const nextBill = upcomingBills[0]
  const daysUntilDue = nextBill ? Math.ceil((new Date(nextBill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Beautiful Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Bills
                  </h1>
                  <p className="text-gray-600 mt-1">Monthly bill tracking</p>
                </div>
              </div>
              
              {admin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bill
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span>Add Bill</span>
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Bill Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              value={formData.amount}
                              onChange={(e) => setFormData({...formData, amount: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                              id="dueDate"
                              type="date"
                              value={formData.dueDate}
                              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Utilities">Utilities</SelectItem>
                              <SelectItem value="Internet">Internet</SelectItem>
                              <SelectItem value="Mobile">Mobile</SelectItem>
                              <SelectItem value="Insurance">Insurance</SelectItem>
                              <SelectItem value="Rent">Rent</SelectItem>
                              <SelectItem value="Loan">Loan</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="recurringType">Recurring</Label>
                          <Select value={formData.recurringType} onValueChange={(value) => setFormData({...formData, recurringType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Input
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Add notes..."
                          />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                            Add Bill
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Paid Bills</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  <span className="animate-counter">{paidBills}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Completed this month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Pending Bills</CardTitle>
                <div className="p-2 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  <span className="animate-counter">{pendingBills}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Awaiting payment</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Next Bill Due</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {nextBill ? (
                  <>
                    <div className="text-lg font-bold text-purple-600 mb-1">
                      {nextBill.name}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-bold text-gray-400 mb-1">
                      No bills due
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      All caught up!
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Overdue Bills</CardTitle>
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 mb-1">
                  <span className="animate-counter">{overdueBills}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Past due date</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bills List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                Bill Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-2xl w-fit mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No bills found. {admin && 'Add your first bill to get started.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill: any, index: number) => {
                    const { status, color, icon: StatusIcon } = getBillStatus(bill)
                    return (
                      <motion.div
                        key={bill._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                      >
                        <Checkbox
                          checked={bill.isPaid}
                          onCheckedChange={() => togglePaid(bill._id)}
                          disabled={!admin}
                          className="scale-125"
                        />
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${
                          color === 'green' ? 'from-green-100 to-emerald-100' :
                          color === 'red' ? 'from-red-100 to-pink-100' :
                          'from-orange-100 to-yellow-100'
                        }`}>
                          <StatusIcon className={`h-5 w-5 ${
                            color === 'green' ? 'text-green-600' :
                            color === 'red' ? 'text-red-600' :
                            'text-orange-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-gray-800 ${bill.isPaid ? 'line-through opacity-60' : ''}`}>
                            {bill.name}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due: {formatDate(bill.dueDate)}
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                              {formatCurrency(bill.amount)}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === 'paid' ? 'bg-green-100 text-green-800' :
                          status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {status === 'paid' ? 'Paid' : status === 'overdue' ? 'Overdue' : 'Pending'}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}