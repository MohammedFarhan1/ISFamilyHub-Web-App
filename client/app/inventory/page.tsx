'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, MapPin, Package, Archive, Grid3X3, Trash2, AlertTriangle } from 'lucide-react'
import Layout from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { inventoryAPI } from '@/lib/api'

export default function InventoryPage() {
  const { admin } = useAuth()
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    description: ''
  })
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll({ search })
      setInventory(response.data)
    } catch (error: any) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await inventoryAPI.create(formData)
      setDialogOpen(false)
      setFormData({ name: '', category: '', location: '', description: '' })
      fetchInventory()
    } catch (error: any) {
      console.error('Failed to create inventory item:', error)
    }
  }

  const handleDelete = async (itemId: string) => {
    setDeleting(itemId)
    try {
      await inventoryAPI.delete(itemId)
      fetchInventory()
    } catch (error: any) {
      console.error('Failed to delete inventory item:', error)
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading inventory...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const totalItems = inventory.length
  const categories = [...new Set(inventory.map((item: any) => item.category))].length
  const locations = [...new Set(inventory.map((item: any) => item.location))].length

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Beautiful Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600/10 via-gray-600/10 to-zinc-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl shadow-lg">
                  <Archive className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-600 via-gray-700 to-zinc-700 bg-clip-text text-transparent">
                    Inventory
                  </h1>
                  <p className="text-gray-600 mt-1">Item location tracker</p>
                </div>
              </div>
              
              {admin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Archive className="h-5 w-5 text-slate-600" />
                        <span>Add Inventory Item</span>
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
                        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Appliances">Appliances</SelectItem>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Books">Books</SelectItem>
                            <SelectItem value="Documents">Documents</SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                            <SelectItem value="Kitchen">Kitchen</SelectItem>
                            <SelectItem value="Bathroom">Bathroom</SelectItem>
                            <SelectItem value="Bedroom">Bedroom</SelectItem>
                            <SelectItem value="Storage">Storage</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="e.g., Living room, Kitchen cabinet"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Additional details..."
                        />
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Total Items</CardTitle>
                <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg">
                  <Package className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-600 mb-1">
                  <span className="animate-counter">{totalItems}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Items tracked</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Categories</CardTitle>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Grid3X3 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  <span className="animate-counter">{categories}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Different types</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="stat-card group cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Locations</CardTitle>
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  <span className="animate-counter">{locations}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Storage areas</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="floating-card">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items by name, category, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gradient-to-r from-gray-50 to-white border-gray-200 focus:border-slate-300 focus:ring-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg">
                  <Archive className="h-5 w-5 text-white" />
                </div>
                Inventory Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-2xl w-fit mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No items found. {admin && 'Add your first item to get started.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inventory.map((item: any, index: number) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-gray-100">
                        <Package className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1 italic">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-100">
                        <MapPin className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-semibold text-gray-700">{item.location}</span>
                      </div>
                      {admin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-all duration-300 rounded-xl"
                              disabled={deleting === item._id}
                            >
                              {deleting === item._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Delete Item
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Are you sure you want to delete <span className="font-semibold text-gray-800">"{item.name}"</span>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(item._id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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