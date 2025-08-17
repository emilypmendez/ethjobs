'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  ExternalLink,
  X,
  Check
} from 'lucide-react'

interface Profile {
  id: string
  wallet_address: string
  email?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  skills: string[]
  experience_level?: string
  location?: string
  remote_preference: boolean
  available_start_date?: string
  created_at: string
  updated_at: string
}

interface UserManagementProps {
  onClose: () => void
}

export default function UserManagement({ onClose }: UserManagementProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,wallet_address.ilike.%${searchQuery}%`)
      }

      if (filterLevel) {
        query = query.eq('experience_level', filterLevel)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching profiles:', error)
      } else {
        setProfiles(data || [])
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProfiles()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, filterLevel])

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)

      if (error) {
        console.error('Error deleting profile:', error)
        alert('Failed to delete profile')
      } else {
        setProfiles(profiles.filter(p => p.id !== profileId))
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(null)
          setShowDetails(false)
        }
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('Failed to delete profile')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getExperienceBadgeColor = (level?: string) => {
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <span className="ml-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {profiles.length} users
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
                    placeholder="Search by name, email, or wallet address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Users List */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {profile.full_name || 'Anonymous User'}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {profile.wallet_address}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setSelectedProfile(profile)
                              setShowDetails(true)
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {profile.experience_level && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getExperienceBadgeColor(profile.experience_level)}`}>
                          {profile.experience_level}
                        </span>
                      )}

                      {profile.skills && profile.skills.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {profile.skills.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{profile.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(profile.created_at)}
                        </div>
                        {profile.remote_preference && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Details Sidebar */}
          {showDetails && selectedProfile && (
            <div className="w-96 border-l bg-gray-50 flex flex-col">
              <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
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
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-sm text-gray-900">{selectedProfile.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedProfile.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                      <p className="text-sm text-gray-900 font-mono break-all">{selectedProfile.wallet_address}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Professional Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience Level</label>
                      <p className="text-sm text-gray-900">{selectedProfile.experience_level || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="text-sm text-gray-900">{selectedProfile.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Remote Preference</label>
                      <p className="text-sm text-gray-900">{selectedProfile.remote_preference ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedProfile.available_start_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Available Start Date</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedProfile.available_start_date)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {selectedProfile.skills && selectedProfile.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedProfile.bio && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Bio</h4>
                    <p className="text-sm text-gray-700">{selectedProfile.bio}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Account Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Created: {formatDate(selectedProfile.created_at)}</div>
                    <div>Last Updated: {formatDate(selectedProfile.updated_at)}</div>
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
