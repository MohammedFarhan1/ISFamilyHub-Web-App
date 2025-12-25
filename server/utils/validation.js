const { z } = require('zod');

const loginSchema = z.object({
  username: z.enum(['Farhan', 'Sheerin']),
  password: z.string().min(1, 'Password is required')
});

const expenseSchema = z.object({
  date: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum([
    'Food & Dining',
    'Groceries',
    'Transportation',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Bills',
    'Other'
  ]),
  paymentMethod: z.enum(['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet']),
  type: z.enum(['expense', 'income']),
  notes: z.string().max(500).optional()
});

const billSchema = z.object({
  name: z.string().min(1, 'Bill name is required').max(100),
  dueDate: z.string(),
  amount: z.number().positive('Amount must be positive'),
  isRecurring: z.boolean().optional(),
  recurringType: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  category: z.enum(['Utilities', 'Internet', 'Mobile', 'Insurance', 'Rent', 'Loan', 'Other']),
  notes: z.string().max(300).optional()
});

const grocerySchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100),
  category: z.enum([
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Pantry',
    'Snacks',
    'Beverages',
    'Frozen',
    'Household',
    'Personal Care',
    'Other'
  ]),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

const inventorySchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100),
  category: z.enum([
    'Electronics',
    'Appliances',
    'Furniture',
    'Clothing',
    'Books',
    'Documents',
    'Tools',
    'Kitchen',
    'Bathroom',
    'Bedroom',
    'Storage',
    'Other'
  ]),
  location: z.string().min(1, 'Location is required').max(100),
  description: z.string().max(300).optional()
});

module.exports = {
  loginSchema,
  expenseSchema,
  billSchema,
  grocerySchema,
  inventorySchema
};