'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Download, Search, FileText, Shield, Calendar, User, Archive, Trash2, AlertTriangle, Lock } from 'lucide-react'
import Layout from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { documentsAPI } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function DocumentsPage() {
  const { admin } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [ownerFilter, setOwnerFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    ownerName: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const getSuggestions = () => {
    if (!search || search.length < 1) return []
    return documents
      .filter(doc => doc.title.toLowerCase().includes(search.toLowerCase()))
      .map(doc => doc.title)
      .slice(0, 5)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (value.length > 0) {
      setSuggestions(getSuggestions())
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const params: any = {}
      if (search) params.search = search
      if (ownerFilter && ownerFilter !== 'all') params.ownerName = ownerFilter
      
      const response = await documentsAPI.getAll(params)
      setDocuments(response.data)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    
    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('ownerName', formData.ownerName)
      
      console.log('Uploading:', {
        file: selectedFile.name,
        title: formData.title,
        ownerName: formData.ownerName
      })
      
      const response = await documentsAPI.upload(uploadFormData)
      console.log('Upload success:', response)
      
      setDialogOpen(false)
      setFormData({ title: '', ownerName: '' })
      setSelectedFile(null)
      fetchDocuments()
    } catch (error) {
      console.error('Failed to upload document:', error)
      console.error('Error response:', error.response?.data)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string, docTitle: string) => {
    setDeleting(docId)
    try {
      await documentsAPI.delete(docId)
      fetchDocuments()
    } catch (error) {
      console.error('Failed to delete document:', error)
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, ownerFilter])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading documents...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Beautiful Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-blue-600/10 to-cyan-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Document Vault
                  </h1>
                  <p className="text-gray-600 mt-1">Secure family document storage</p>
                </div>
              </div>
              
              {admin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        <span>Upload Document</span>
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="file">Select File</Label>
                        <Input
                          id="file"
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          required
                          className="mt-1"
                        />
                        {selectedFile && (
                          <p className="text-sm text-gray-500 mt-1">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="title">Document Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="Enter document title"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ownerName">Owner</Label>
                        <Select value={formData.ownerName} onValueChange={(value) => setFormData({...formData, ownerName: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sirazdeen">Sirazdeen (Father)</SelectItem>
                            <SelectItem value="Rahima Banu">Rahima Banu (Mother)</SelectItem>
                            <SelectItem value="Shafan & Sheerin">Shafan & Sheerin</SelectItem>
                            <SelectItem value="Irfan">Irfan</SelectItem>
                            <SelectItem value="Farhan">Farhan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setDialogOpen(false)
                            setSelectedFile(null)
                            setFormData({ title: '', ownerName: '' })
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={uploading || !selectedFile}
                          className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
                        >
                          {uploading ? 'Uploading...' : 'Upload Document'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="floating-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents by title..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => search && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-10 bg-gradient-to-r from-gray-50 to-white border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-b-0"
                          onClick={() => {
                            setSearch(suggestion)
                            setShowSuggestions(false)
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    <SelectItem value="Sirazdeen">Sirazdeen (Father)</SelectItem>
                    <SelectItem value="Rahima Banu">Rahima Banu (Mother)</SelectItem>
                    <SelectItem value="Shafan & Sheerin">Shafan & Sheerin</SelectItem>
                    <SelectItem value="Irfan">Irfan</SelectItem>
                    <SelectItem value="Farhan">Farhan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="floating-card">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Secure Documents</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Family document vault with encryption</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-indigo-600">{documents.length}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {documents.length === 1 ? 'document' : 'documents'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mx-auto w-fit mb-6">
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-3xl">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      <Lock className="h-3 w-3" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Documents Found</h3>
                  <p className="text-gray-500 font-medium max-w-md mx-auto">
                    {admin ? 'Upload your first secure document to get started with the family vault.' : 'No documents are currently available in the secure vault.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc: any, index: number) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex-shrink-0">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{doc.title}</h3>
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{doc.ownerName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-300 rounded-xl"
                        >
                          <a href={`/api/documents/download/${doc._id}`} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          </a>
                        </Button>
                        
                        {admin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-all duration-300 rounded-xl"
                                disabled={deleting === doc._id}
                              >
                                {deleting === doc._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-red-500 border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                  <AlertTriangle className="h-5 w-5" />
                                  Delete Document
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  Are you sure you want to permanently delete <span className="font-semibold text-gray-800">"{doc.title}"</span>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(doc._id, doc.title)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </motion.div>
                  ))
                }</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}