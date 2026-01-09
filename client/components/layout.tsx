'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  DollarSign,
  FileText,
  ShoppingCart,
  Download,
  FolderOpen,
  Package,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, color: 'from-blue-500 to-cyan-600' },
  { name: 'Expenses', href: '/expenses', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
  { name: 'Bills', href: '/bills', icon: FileText, color: 'from-orange-500 to-red-500' },
  { name: 'Groceries', href: '/groceries', icon: ShoppingCart, color: 'from-purple-500 to-pink-600' },
  { name: 'Export', href: '/export', icon: Download, color: 'from-indigo-500 to-purple-600' },
  { name: 'Documents', href: '/documents', icon: FolderOpen, color: 'from-teal-500 to-cyan-600' },
  { name: 'Inventory', href: '/inventory', icon: Package, color: 'from-yellow-500 to-orange-500' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { admin, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 lg:hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ISFamilyHub</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent admin={admin} pathname={pathname} onLogout={handleLogout} mobile />
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-1 flex-col min-h-0 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
          <SidebarContent admin={admin} pathname={pathname} onLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 shadow-sm lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="rounded-full hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch">
            <div className="flex items-center gap-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ISFamilyHub</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl lg:hidden">
        <div className="grid grid-cols-4 gap-1 p-3">
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-2xl text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl mb-1 transition-all duration-300",
                  isActive 
                    ? `bg-gradient-to-br ${item.color} shadow-lg` 
                    : "bg-gray-100"
                )}>
                  <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-500")} />
                </div>
                <span className="truncate text-xs">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 lg:hidden" />
    </div>
  )
}

function SidebarContent({ 
  admin, 
  pathname, 
  onLogout,
  mobile = false
}: { 
  admin: any
  pathname: string
  onLogout: () => void
  mobile?: boolean
}) {
  return (
    <>
      <div className="flex flex-1 flex-col pt-6 pb-4 overflow-y-auto">
        {!mobile && (
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ISFamilyHub</h1>
            </div>
          </div>
        )}
        <nav className={cn("flex-1 px-4 space-y-2", mobile ? "mt-4" : "")}>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-150 hover:scale-105",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg border border-blue-100"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  prefetch={true}
                >
                  <div className={cn(
                    "p-2 rounded-xl mr-4 transition-all duration-300",
                    isActive 
                      ? `bg-gradient-to-br ${item.color} shadow-lg` 
                      : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                      )}
                    />
                  </div>
                  {item.name}
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </div>
      
      {admin && (
        <div className="flex-shrink-0 border-t border-gray-100 p-4">
          <div className="flex items-center w-full p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
              <p className="text-xs text-gray-500 font-medium">Administrator</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}