'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, CreditCard } from 'lucide-react'
import Layout from '@/components/layout'
import TransactionDetailModal from '@/components/transaction-detail-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { expensesAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface Transaction {
  _id: string
  title?: string
  amount: number
  category: string
  paymentMethod: string
  type: 'expense' | 'income'
  notes?: string
  date: string
  createdAt: string
}

export default function CategoryTransactionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    if (category) {
      fetchCategoryTransactions()
    }
  }, [category])

  const fetchCategoryTransactions = async () => {
    try {
      const response = await expensesAPI.getAll({ category })
      setTransactions(response.data)
      
      // Calculate total for this category
      const total = response.data.reduce((sum: number, transaction: Transaction) => {
        return transaction.type === 'expense' ? sum + transaction.amount : sum
      }, 0)
      setTotalAmount(total)
    } catch (error) {
      console.error('Failed to fetch category transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category}</h1>
            <p className="text-gray-600">Total spent: {formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">No transactions found in this category</div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          {transaction.title || 'Untitled Transaction'}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CreditCard className="h-3 w-3" />
                            <span>{transaction.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'expense' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  )
}