'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit3, Calendar, ChefHat, Clock, Utensils } from 'lucide-react'
import Layout from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mealsAPI } from '@/lib/api'
import { getWeekStart } from '@/lib/utils'

export default function MealsPage() {
  const { admin } = useAuth()
  const [mealPlan, setMealPlan] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [editingMeal, setEditingMeal] = useState<{day: string, mealType: string, currentMeal: string}>({ day: '', mealType: '', currentMeal: '' })
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart())
  const [mealInput, setMealInput] = useState<string>('')

  useEffect(() => {
    fetchMealPlan()
    
    // Auto-refresh for normal users every 3 seconds
    if (!admin) {
      const interval = setInterval(fetchMealPlan, 3000)
      return () => clearInterval(interval)
    }
  }, [weekStart, admin])

  const fetchMealPlan = async () => {
    try {
      const response = await mealsAPI.get({ weekStart: weekStart.toISOString() })
      setMealPlan(response.data)
    } catch (error: any) {
      console.error('Failed to fetch meal plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditMeal = (day: string, mealType: string, currentMeal: string) => {
    setEditingMeal({ day, mealType, currentMeal })
    setMealInput(currentMeal)
    setDialogOpen(true)
  }

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mealsAPI.updateMeal(editingMeal.day, editingMeal.mealType, {
        meal: mealInput,
        weekStartDate: weekStart.toISOString()
      })
      setDialogOpen(false)
      setMealInput('')
      fetchMealPlan()
    } catch (error: any) {
      console.error('Failed to update meal:', error)
    }
  }

  const changeWeek = (direction: number) => {
    const newWeekStart = new Date(weekStart)
    newWeekStart.setDate(newWeekStart.getDate() + (direction * 7))
    setWeekStart(newWeekStart)
  }

  const getDateForDay = (dayIndex: number) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + dayIndex)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Clock className="h-4 w-4 text-orange-500" />
      case 'lunch': return <Utensils className="h-4 w-4 text-blue-500" />
      case 'dinner': return <ChefHat className="h-4 w-4 text-purple-500" />
      default: return <Utensils className="h-4 w-4" />
    }
  }

  const getMealGradient = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'from-orange-50 to-yellow-50 border-orange-100'
      case 'lunch': return 'from-blue-50 to-cyan-50 border-blue-100'
      case 'dinner': return 'from-purple-50 to-pink-50 border-purple-100'
      default: return 'from-gray-50 to-gray-100 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading meal plans...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const mealTypes = ['breakfast', 'lunch', 'dinner']

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Beautiful Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-yellow-600/10 to-red-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                    Meal Planner
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Plan your family's weekly meals</p>
                </div>
              </div>
              
              {/* Week Navigation */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100 order-2 sm:order-1">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">
                    {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 order-1 sm:order-2">
                  <Button 
                    variant="outline" 
                    onClick={() => changeWeek(-1)}
                    className="hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 text-xs sm:text-sm px-3 py-2"
                  >
                    ← Prev
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => changeWeek(1)}
                    className="hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 text-xs sm:text-sm px-3 py-2"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Grid */}
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
            >
              <Card className="floating-card">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-800">{dayNames[dayIndex]}</div>
                        <div className="text-sm text-gray-500 font-medium">{getDateForDay(dayIndex)}</div>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mealTypes.map((mealType) => {
                      const meal = mealPlan?.meals?.[day]?.[mealType] || ''
                      return (
                        <motion.div 
                          key={mealType} 
                          className={`relative p-4 rounded-xl bg-gradient-to-br ${getMealGradient(mealType)} border transition-all duration-300 hover:shadow-lg group`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getMealIcon(mealType)}
                              <span className="text-sm font-bold text-gray-700 capitalize">{mealType}</span>
                            </div>
                            {admin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-white/70 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                onClick={() => handleEditMeal(day, mealType, meal)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 font-medium min-h-[2.5rem] flex items-center">
                            {meal || (
                              <span className="text-gray-400 italic text-xs">
                                {admin ? 'Click to add meal' : 'Not planned'}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Edit Meal Dialog */}
        {admin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getMealIcon(editingMeal.mealType)}
                  <span>
                    Edit {editingMeal.mealType} for {editingMeal.day}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveMeal} className="space-y-4">
                <div>
                  <Label htmlFor="meal" className="text-sm font-medium text-gray-700">Meal Name</Label>
                  <Input
                    id="meal"
                    value={mealInput}
                    onChange={(e) => setMealInput(e.target.value)}
                    placeholder="Enter meal name..."
                    className="mt-1"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Save Meal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  )
}