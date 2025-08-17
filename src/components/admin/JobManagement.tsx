'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Briefcase, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  MapPin,
  DollarSign,
  Building,
  X,
  Check,
  Clock,
  Users,
  ExternalLink
} from 'lucide-react'

interface Job {
  id: string
  title: string
  company_id: string
  description: string
  requirements?: string
  location: string
  remote: boolean
  salary_min?: number
  salary_max?: number
  salary_currency: string
  blockchain_networks: string[]
  tech_stack: string[]
  experience_level: string
  employment_type: string
  posted_at: string
  expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
  companies?: {
    id: string
    name: string
    website?: string
    description?: string
  }
}

interface JobManagementProps {
  onClose: () => void
}

export default function JobManagement({ onClose }: JobManagementProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterLevel, setFilterLevel] = useState<string>('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            website,
            description
          )
        `)
        .order('created_at', { ascending: false })

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      if (filterStatus === 'active') {
        query = query.eq('is_active', true)
      } else if (filterStatus === 'inactive') {
        query = query.eq('is_active', false)
      }

      if (filterLevel) {
        query = query.eq('experience_level', filterLevel)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching jobs:', error)
      } else {
        setJobs(data || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchJobs()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, filterStatus, filterLevel])

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !currentStatus })
        .eq('id', jobId)

      if (error) {
        console.error('Error updating job status:', error)
        alert('Failed to update job status')
      } else {
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, is_active: !currentStatus } : job
        ))
        if (selectedJob?.id === jobId) {
          setSelectedJob({ ...selectedJob, is_active: !currentStatus })
        }
      }
    } catch (error) {
      console.error('Error updating job status:', error)
      alert('Failed to update job status')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (error) {
        console.error('Error deleting job:', error)
        alert('Failed to delete job')
      } else {
        setJobs(jobs.filter(j => j.id !== jobId))
        if (selectedJob?.id === jobId) {
          setSelectedJob(null)
          setShowDetails(false)
        }
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatSalary = (min?: number, max?: number, currency: string = 'PYUSD') => {
    if (!min && !max) return 'Not specified'
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
    if (min) return `${min.toLocaleString()}+ ${currency}`
    if (max) return `Up to ${max.toLocaleString()} ${currency}`
    return 'Not specified'
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'Entry': return 'bg-green-100 text-green-800'
      case 'Mid': return 'bg-blue-100 text-blue-800'
      case 'Senior': return 'bg-purple-100 text-purple-800'
      case 'Lead': return 'bg-orange-100 text-orange-800'
      case 'Executive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Briefcase className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
            <span className="ml-3 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
              {jobs.length} jobs
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
                    placeholder="Search jobs by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry">Entry</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.is_active)}`}>
                              {job.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceBadgeColor(job.experience_level)}`}>
                              {job.experience_level}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {job.companies?.name || 'Unknown Company'}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location} {job.remote && '(Remote)'}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(job.posted_at)}
                            </div>
                          </div>

                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                            {job.description}
                          </p>

                          {job.tech_stack && job.tech_stack.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {job.tech_stack.slice(0, 5).map((tech, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                              {job.tech_stack.length > 5 && (
                                <span className="text-xs text-gray-500">
                                  +{job.tech_stack.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedJob(job)
                              setShowDetails(true)
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleJobStatus(job.id, job.is_active)}
                            className={`p-2 rounded ${job.is_active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={job.is_active ? 'Deactivate Job' : 'Activate Job'}
                          >
                            {job.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Job"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job Details Sidebar */}
          {showDetails && selectedJob && (
            <div className="w-96 border-l bg-gray-50 flex flex-col">
              <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
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
                  <h4 className="font-medium text-gray-900 mb-3">Job Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <p className="text-sm text-gray-900">{selectedJob.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Company</label>
                      <p className="text-sm text-gray-900">{selectedJob.companies?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="text-sm text-gray-900">
                        {selectedJob.location} {selectedJob.remote && '(Remote Available)'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Employment Type</label>
                      <p className="text-sm text-gray-900">{selectedJob.employment_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience Level</label>
                      <p className="text-sm text-gray-900">{selectedJob.experience_level}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Salary</label>
                      <p className="text-sm text-gray-900">
                        {formatSalary(selectedJob.salary_min, selectedJob.salary_max, selectedJob.salary_currency)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}

                {/* Tech Stack */}
                {selectedJob.tech_stack && selectedJob.tech_stack.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.tech_stack.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blockchain Networks */}
                {selectedJob.blockchain_networks && selectedJob.blockchain_networks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Blockchain Networks</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.blockchain_networks.map((network, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                        >
                          {network}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Job Timeline</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Posted: {formatDate(selectedJob.posted_at)}</div>
                    <div>Created: {formatDate(selectedJob.created_at)}</div>
                    <div>Last Updated: {formatDate(selectedJob.updated_at)}</div>
                    {selectedJob.expires_at && (
                      <div>Expires: {formatDate(selectedJob.expires_at)}</div>
                    )}
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
