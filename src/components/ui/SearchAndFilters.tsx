'use client'

import { useState } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchAndFiltersProps {
  onSearch?: (query: string) => void
  onFilterChange?: (filters: any) => void
  className?: string
}

export default function SearchAndFilters({ 
  onSearch, 
  onFilterChange, 
  className 
}: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedChains, setSelectedChains] = useState<string[]>([])
  const [selectedStacks, setSelectedStacks] = useState<string[]>([])

  const chains = ['All Chains', 'Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base']
  const stacks = ['All Stacks', 'Solidity', 'React', 'Node.js', 'Python', 'Rust', 'Go']

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Web3 jobs..."
              className="block w-full pl-12 pr-32 py-3 border border-gray-300 rounded-lg text-lg leading-6 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-r-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Search Jobs
              </button>
            </div>
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              showFilters && 'rotate-180'
            )} />
          </button>

          <div className="text-sm text-gray-500">
            Showing latest opportunities
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chain Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blockchain Networks
                </label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  {chains.map((chain) => (
                    <option key={chain} value={chain}>
                      {chain}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stack Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack
                </label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  {stacks.map((stack) => (
                    <option key={stack} value={stack}>
                      {stack}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
