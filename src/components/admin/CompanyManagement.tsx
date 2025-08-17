'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Building, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  ExternalLink,
  X,
  Check,
  Clock,
  AlertCircle,
  Globe,
  MapPin,
  Users
} from 'lucide-react'

interface Company {
  id: string
  name: string
  website?: string
  description?: string
  logo_url?: string
  industry?: string
  location?: string
  employer_type?: string
  verification_status?: string
  verified_at?: string
  created_at: string
  updated_at: string
  job_count?: number
}

interface CompanyManagementProps {
  onClose: () => void
}

export default function CompanyManagement({ onClose }: CompanyManagementProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('companies')
        .select(`
          *,
          jobs(count)
        `)
        .order('created_at', { ascending: false })

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,website.ilike.%${searchQuery}%`)
      }

      if (filterStatus) {
        query = query.eq('verification_status', filterStatus)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching companies:', error)
      } else {
        // Process the data to include job counts
        const processedData = (data || []).map(company => ({
          ...company,
          job_count: Array.isArray(company.jobs) ? company.jobs.length : 0
        }))
        setCompanies(processedData)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCompanies()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, filterStatus])

  const handleVerifyCompany = async (companyId: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'verified' ? 'pending' : 'verified'
    
    try {
      const updateData: any = { verification_status: newStatus }
      if (newStatus === 'verified') {
        updateData.verified_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', companyId)

      if (error) {
        console.error('Error updating company verification:', error)
        alert('Failed to update company verification status')
      } else {
        setCompanies(companies.map(company => 
          company.id === companyId 
            ? { ...company, verification_status: newStatus, verified_at: newStatus === 'verified' ? new Date().toISOString() : company.verified_at }
            : company
        ))
        if (selectedCompany?.id === companyId) {
          setSelectedCompany({ 
            ...selectedCompany, 
            verification_status: newStatus,
            verified_at: newStatus === 'verified' ? new Date().toISOString() : selectedCompany.verified_at
          })
        }
      }
    } catch (error) {
      console.error('Error updating company verification:', error)
      alert('Failed to update company verification status')
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This will also delete all associated jobs. This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)

      if (error) {
        console.error('Error deleting company:', error)
        alert('Failed to delete company')
      } else {
        setCompanies(companies.filter(c => c.id !== companyId))
        if (selectedCompany?.id === companyId) {
          setSelectedCompany(null)
          setShowDetails(false)
        }
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Failed to delete company')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationIcon = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Check className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
            <span className="ml-3 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
              {companies.length} companies
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search and Filters */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search companies by name, description, or website..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Companies List */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {company.name}
                            </h3>
                            {company.verification_status && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationBadge(company.verification_status)}`}>
                                {company.verification_status}
                              </span>
                            )}
                          </div>
                          {company.website && (
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <Globe className="h-4 w-4 mr-1" />
                              <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-indigo-600 truncate"
                              >
                                {company.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                          {company.location && (
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              {company.location}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              setSelectedCompany(company)
                              setShowDetails(true)
                            }}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {company.verification_status !== undefined && (
                            <button
                              onClick={() => handleVerifyCompany(company.id, company.verification_status)}
                              className={`p-1 rounded ${company.verification_status === 'verified' 
                                ? 'text-yellow-600 hover:bg-yellow-50' 
                                : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={company.verification_status === 'verified' ? 'Mark as Pending' : 'Verify Company'}
                            >
                              {getVerificationIcon(company.verification_status === 'verified' ? 'pending' : 'verified')}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCompany(company.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Company"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {company.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {company.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(company.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {company.job_count || 0} jobs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Company Details Sidebar */}
          {showDetails && selectedCompany && (
            <div className="w-96 border-l bg-gray-50 flex flex-col">
              <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedCompany.name}</p>
                    </div>
                    {selectedCompany.website && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Website</label>
                        <p className="text-sm text-gray-900">
                          <a 
                            href={selectedCompany.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center"
                          >
                            {selectedCompany.website}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </p>
                      </div>
                    )}
                    {selectedCompany.industry && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Industry</label>
                        <p className="text-sm text-gray-900">{selectedCompany.industry}</p>
                      </div>
                    )}
                    {selectedCompany.location && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <p className="text-sm text-gray-900">{selectedCompany.location}</p>
                      </div>
                    )}
                    {selectedCompany.employer_type && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company Type</label>
                        <p className="text-sm text-gray-900">{selectedCompany.employer_type}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Status */}
                {selectedCompany.verification_status && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Verification Status</h4>
                    <div className="flex items-center mb-2">
                      {getVerificationIcon(selectedCompany.verification_status)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {selectedCompany.verification_status}
                      </span>
                    </div>
                    {selectedCompany.verified_at && (
                      <p className="text-sm text-gray-600">
                        Verified on {formatDate(selectedCompany.verified_at)}
                      </p>
                    )}
                  </div>
                )}

                {/* Description */}
                {selectedCompany.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCompany.description}</p>
                  </div>
                )}

                {/* Job Statistics */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Job Statistics</h4>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Jobs Posted</span>
                      <span className="text-lg font-semibold text-gray-900">{selectedCompany.job_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Company Timeline</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Created: {formatDate(selectedCompany.created_at)}</div>
                    <div>Last Updated: {formatDate(selectedCompany.updated_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
