'use client'

import { useState } from 'react'
import Header from '@/components/ui/Header'
import HeroSection from '@/components/ui/HeroSection'
import SearchAndFilters, { JobFilters } from '@/components/ui/SearchAndFilters'
import JobsList from '@/components/jobs/JobsList'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filters, setFilters] = useState<JobFilters>({ chains: [], stacks: [] })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: JobFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <SearchAndFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <JobsList
        searchQuery={searchQuery}
        filters={filters}
      />
    </div>
  );
}
