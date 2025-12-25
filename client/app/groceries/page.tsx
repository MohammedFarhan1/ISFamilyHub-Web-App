'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, ShoppingCart, CheckCircle2, Clock, AlertTriangle, Package, Search, Filter } from 'lucide-react'
import Layout from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { groceriesAPI } from '@/lib/api'

export default function GroceriesPage() {
  const { admin } = useAuth()
  const [groceries, setGroceries] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    customCategory: '',
    priority: 'medium'
  })

  useEffect(() => {
    fetchGroceries()
    
    // Auto-refresh for normal users every 3 seconds
    if (!admin) {
      const interval = setInterval(fetchGroceries, 3000)
      return () => clearInterval(interval)
    }
  }, [admin])

  const fetchGroceries = async () => {
    try {
      const response = await groceriesAPI.getAll()
      setGroceries(response.data)
    } catch (error: any) {
      console.error('Failed to fetch groceries:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePurchased = async (id: string) => {
    if (!admin) return
    try {
      await groceriesAPI.togglePurchased(id)
      fetchGroceries()
    } catch (error: any) {
      console.error('Failed to toggle grocery:', error)
    }
  }

  const deleteItem = async (id: string) => {
    if (!admin) return
    try {
      await groceriesAPI.delete(id)
      fetchGroceries()
    } catch (error: any) {
      console.error('Failed to delete grocery item:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalCategory = formData.category === 'custom' ? formData.customCategory : formData.category
    if (!finalCategory) {
      alert('Please select a category or enter a custom one')
      return
    }
    try {
      await groceriesAPI.create({
        ...formData,
        category: finalCategory
      })
      setDialogOpen(false)
      setFormData({ name: '', category: '', customCategory: '', priority: 'medium' })
      fetchGroceries()
    } catch (error: any) {
      console.error('Failed to create grocery:', error)
      alert('Failed to add item. Please try again.')
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'rose', bg: 'from-rose-100 to-pink-100', text: 'text-rose-800', badge: 'bg-rose-100 text-rose-800' }
      case 'medium': return { color: 'slate', bg: 'from-slate-100 to-gray-100', text: 'text-slate-800', badge: 'bg-slate-100 text-slate-800' }
      case 'low': return { color: 'emerald', bg: 'from-emerald-100 to-teal-100', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' }
      default: return { color: 'gray', bg: 'from-gray-100 to-gray-200', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-800' }
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading grocery list...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const purchasedItems = groceries.filter((item: any) => item.isPurchased).length
  const pendingItems = groceries.filter((item: any) => !item.isPurchased).length
  const highPriorityItems = groceries.filter((item: any) => !item.isPurchased && item.priority === 'high').length

  // Filter groceries based on search and filters
  const filteredGroceries = groceries.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || !filterCategory || item.category === filterCategory
    const matchesStatus = filterStatus === 'all' || !filterStatus || 
      (filterStatus === 'purchased' && item.isPurchased) ||
      (filterStatus === 'pending' && !item.isPurchased)
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Beautiful Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Grocery List
                  </h1>
                  <p className="text-gray-600 mt-1">Family shopping checklist</p>
                </div>
              </div>
              
              {admin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <ShoppingCart className="h-5 w-5 text-emerald-600" />
                          <span>Add Grocery Item</span>
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Item Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Fruits & Vegetables">Fruits & Vegetables</SelectItem>
                              <SelectItem value="Dairy & Eggs">Dairy & Eggs</SelectItem>
                              <SelectItem value="Meat & Seafood">Meat & Seafood</SelectItem>
                              <SelectItem value="Pantry">Pantry</SelectItem>
                              <SelectItem value="Snacks">Snacks</SelectItem>
                              <SelectItem value="Household">Household</SelectItem>
                              <SelectItem value="Personal Care">Personal Care</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                              <SelectItem value="custom">Create New Category</SelectItem>
                            </SelectContent>
                          </Select>
                          {formData.category === 'custom' && (
                            <Input
                              placeholder="Enter new category name"
                              value={formData.customCategory}
                              onChange={(e) => setFormData({...formData, customCategory: e.target.value})}
                              className="mt-2"
                              required
                            />
                          )}
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                            Add Item
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Fruits & Vegetables">Fruits & Vegetables</SelectItem>
              <SelectItem value="Dairy & Eggs">Dairy & Eggs</SelectItem>
              <SelectItem value="Meat & Seafood">Meat & Seafood</SelectItem>
              <SelectItem value="Pantry">Pantry</SelectItem>
              <SelectItem value="Snacks">Snacks</SelectItem>
              <SelectItem value="Household">Household</SelectItem>
              <SelectItem value="Personal Care">Personal Care</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Purchased</CardTitle>
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  <span className="animate-counter">{purchasedItems}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Items completed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Pending</CardTitle>
                <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-600 mb-1">
                  <span className="animate-counter">{pendingItems}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Items to buy</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">High Priority</CardTitle>
                <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600 mb-1">
                  <span className="animate-counter">{highPriorityItems}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Urgent items</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Shopping Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                Shopping Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredGroceries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-2xl w-fit mx-auto mb-4">
                    <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    {searchTerm || filterCategory || filterStatus ? 'No items match your filters.' : 'No grocery items found.'} {admin && !searchTerm && !filterCategory && !filterStatus && 'Add your first item to get started.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGroceries.map((item: any, index: number) => {
                    const priorityConfig = getPriorityConfig(item.priority)
                    return (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                      >
                        <Checkbox
                          checked={item.isPurchased}
                          onCheckedChange={() => togglePurchased(item._id)}
                          disabled={!admin}
                          className="scale-125"
                        />
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${priorityConfig.bg}`}>
                          <div className={`w-3 h-3 rounded-full ${
                            item.priority === 'high' ? 'bg-rose-500' :
                            item.priority === 'medium' ? 'bg-slate-500' :
                            'bg-emerald-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-gray-800 ${item.isPurchased ? 'line-through opacity-60' : ''}`}>
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityConfig.badge}`}>
                          {item.priority}
                        </div>
                        {admin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteItem(item._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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