'use client'

import { useState, useEffect } from 'react'
import { Job } from '@/lib/database.types'
import JobCard from './JobCard'
import { supabase } from '@/lib/supabase'
import { JobFilters } from '@/components/ui/SearchAndFilters'

interface JobsListProps {
  searchQuery?: string
  filters?: JobFilters
}

export default function JobsList({ searchQuery, filters }: JobsListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, filters])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            website
          )
        `)
        .eq('is_active', true)
        .order('posted_at', { ascending: false })

      // Add search functionality if query exists
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Add filter functionality
      if (filters?.chains && filters.chains.length > 0) {
        // Filter by blockchain networks - using overlaps operator for array fields
        query = query.overlaps('blockchain_networks', filters.chains)
      }

      if (filters?.stacks && filters.stacks.length > 0) {
        // Filter by tech stack - using overlaps operator for array fields
        query = query.overlaps('tech_stack', filters.stacks)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setJobs(data || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs. Please try again.')
      // Set mock data for development
      setJobs(mockJobs)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="flex space-x-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchJobs}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {jobs.length} Web3 Jobs Available
        </h2>
        <div className="text-sm text-gray-500">
          Showing latest opportunities
        </div>
      </div>

      {/* Jobs Grid */}
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No jobs found matching your criteria.</div>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear filters and try again
          </button>
        </div>
      )}
    </div>
  )
}

// Mock data for development/fallback
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Solidity Developer',
    company_id: '1',
    description: 'We are looking for an experienced Solidity developer to join our core protocol team.',
    requirements: 'Strong experience with Solidity, Hardhat, and DeFi protocols.',
    location: 'Remote',
    remote: true,
    salary_min: 120000,
    salary_max: 180000,
    salary_currency: 'PYUSD',
    blockchain_networks: ['Ethereum'],
    tech_stack: ['Solidity', 'DeFi', 'Web3'],
    experience_level: 'Senior',
    employment_type: 'Full-time',
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    companies: {
      id: '1',
      name: 'defiprotocol.eth',
      logo_url: null,
      website: 'https://defiprotocol.eth',
      description: 'Leading DeFi protocol',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    title: 'Frontend Web3 Engineer',
    company_id: '2',
    description: 'Join our frontend team to build cutting-edge Web3 applications.',
    requirements: 'Experience with React, TypeScript, and Web3 libraries.',
    location: 'San Francisco',
    remote: false,
    salary_min: 100000,
    salary_max: 150000,
    salary_currency: 'PYUSD',
    blockchain_networks: ['Polygon'],
    tech_stack: ['React', 'Web3.js', 'TypeScript'],
    experience_level: 'Mid',
    employment_type: 'Full-time',
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    companies: {
      id: '2',
      name: 'MetaVerse Studios',
      logo_url: null,
      website: 'https://metaversestudios.com',
      description: 'Creating immersive Web3 experiences',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '3',
    title: 'DevOps Engineer - Blockchain',
    company_id: '3',
    description: 'We need a DevOps engineer with blockchain expertise to manage our infrastructure.',
    requirements: 'Experience with Kubernetes, AWS, and blockchain node operations.',
    location: 'Remote',
    remote: true,
    salary_min: 90000,
    salary_max: 130000,
    salary_currency: 'PYUSD',
    blockchain_networks: ['Ethereum', 'Polygon', 'Arbitrum'],
    tech_stack: ['DevOps', 'Kubernetes', 'AWS'],
    experience_level: 'Senior',
    employment_type: 'Full-time',
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    companies: {
      id: '3',
      name: 'chaininfra.eth',
      logo_url: null,
      website: 'https://chaininfra.eth',
      description: 'Blockchain infrastructure solutions',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
]
