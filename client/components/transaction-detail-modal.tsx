'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, CreditCard, DollarSign, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface Transaction {
  _id: string
  amount: number
  category: string
  paymentMethod: string
  type: 'expense' | 'income'
  notes?: string
  date: string
  createdAt: string
}

interface TransactionDetailModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export default function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:max-w-md lg:w-full lg:max-h-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              {(transaction.title || transaction.notes) && (
                <div className="text-center border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {transaction.title || transaction.notes || 'Untitled Transaction'}
                  </h3>
                </div>
              )}

              {/* Amount */}
              <div className="text-center">
                <div className={`text-3xl font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  transaction.type === 'expense' 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {transaction.type === 'expense' ? 'Expense' : 'Income'}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Tag className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="font-medium text-gray-900">{transaction.category}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Payment Method</div>
                    <div className="font-medium text-gray-900">{transaction.paymentMethod}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium text-gray-900">{formatDate(transaction.date)}</div>
                  </div>
                </div>

                {transaction.notes && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <DollarSign className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Notes</div>
                      <div className="font-medium text-gray-900">{transaction.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}