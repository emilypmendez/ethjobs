'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import SearchAndFilters from '../../../components/ui/SearchAndFilters'
import MatchedJobsList from '@/components/jobs/MatchedJobsList'
import { BreadcrumbNavigation } from '@/components/ui/FlowNavigation'
import { filterAndRankJobs, JobMatchScore, JobFilters } from '@/lib/jobMatching'
import { Job } from '@/lib/database.types'
import { Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

function JobsPageContent() {
  const searchParams = useSearchParams()
  const [filteredJobs, setFilteredJobs] = useState<JobMatchScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<JobFilters>({})

  // Parse URL parameters on component mount
  useEffect(() => {
    const skillsParam = searchParams.get('skills')
    const dateParam = searchParams.get('date')
    const experienceParam = searchParams.get('experience')

    const initialFilters: JobFilters = {}

    if (skillsParam) {
      try {
        initialFilters.skills = JSON.parse(decodeURIComponent(skillsParam))
      } catch (error) {
        console.error('Error parsing skills parameter:', error)
      }
    }

    if (dateParam) {
      initialFilters.availableDate = dateParam
    }

    if (experienceParam) {
      initialFilters.experienceLevel = experienceParam
    }

    setFilters(initialFilters)
  }, [searchParams])

  // Load and filter jobs when filters change
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual Supabase query
        // For now, using mock data
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Senior Frontend Developer',
            company_id: 'company1',
            description: 'Build amazing Web3 applications with React and TypeScript',
            requirements: 'React, TypeScript, Web3.js experience required',
            location: 'Remote',
            remote: true,
            salary_min: 80000,
            salary_max: 120000,
            salary_currency: 'USD',
            blockchain_networks: ['Ethereum', 'Polygon'],
            tech_stack: ['React', 'TypeScript', 'Web3.js', 'Ethers.js', 'Next.js'],
            experience_level: 'Senior',
            employment_type: 'full-time',
            posted_at: new Date().toISOString(),
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company1',
              name: 'Web3 Startup',
              logo_url: null,
              website: 'https://web3startup.com',
              description: 'Building the future of DeFi',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: '2',
            title: 'Smart Contract Developer',
            company_id: 'company2',
            description: 'Develop and audit smart contracts for DeFi protocols',
            requirements: 'Solidity, Hardhat, OpenZeppelin experience',
            location: 'San Francisco, CA',
            remote: false,
            salary_min: 100000,
            salary_max: 150000,
            salary_currency: 'USD',
            blockchain_networks: ['Ethereum', 'Arbitrum'],
            tech_stack: ['Solidity', 'Hardhat', 'OpenZeppelin', 'JavaScript', 'Node.js'],
            experience_level: 'Mid',
            employment_type: 'full-time',
            posted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company2',
              name: 'DeFi Protocol',
              logo_url: null,
              website: 'https://defiprotocol.com',
              description: 'Leading DeFi infrastructure',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: '3',
            title: 'Full Stack Web3 Developer',
            company_id: 'company3',
            description: 'Build end-to-end Web3 applications',
            requirements: 'React, Node.js, Solidity, Web3 integration',
            location: 'New York, NY',
            remote: true,
            salary_min: 90000,
            salary_max: 130000,
            salary_currency: 'USD',
            blockchain_networks: ['Ethereum', 'Polygon', 'Base'],
            tech_stack: ['React', 'Node.js', 'Solidity', 'Web3.js', 'MongoDB', 'Express.js'],
            experience_level: 'Mid',
            employment_type: 'full-time',
            posted_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company3',
              name: 'Blockchain Solutions',
              logo_url: null,
              website: 'https://blockchainsolutions.com',
              description: 'Enterprise blockchain solutions',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: '4',
            title: 'DeFi Product Manager',
            company_id: 'company4',
            description: 'Lead product development for DeFi lending platform',
            requirements: 'Product management, DeFi, UX/UI, Agile',
            location: 'Remote',
            remote: true,
            salary_min: 110000,
            salary_max: 140000,
            salary_currency: 'USD',
            blockchain_networks: ['Ethereum'],
            tech_stack: ['Jira', 'Figma', 'Notion'],
            experience_level: 'Senior',
            employment_type: 'full-time',
            posted_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company4',
              name: 'LendFi',
              logo_url: null,
              website: 'https://lendfi.com',
              description: 'Decentralized lending made simple',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: '5',
            title: 'Crypto Backend Engineer',
            company_id: 'company5',
            description: 'Build scalable backend for NFT marketplace',
            requirements: 'Node.js, PostgreSQL, Web3.js, REST APIs',
            location: 'London, UK',
            remote: true,
            salary_min: 95000,
            salary_max: 125000,
            salary_currency: 'GBP',
            blockchain_networks: ['Ethereum', 'Polygon'],
            tech_stack: ['Node.js', 'PostgreSQL', 'Web3.js', 'Docker'],
            experience_level: 'Mid',
            employment_type: 'full-time',
            posted_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company5',
              name: 'NFT Hub',
              logo_url: null,
              website: 'https://nfthub.com',
              description: 'Marketplace for digital collectibles',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: '6',
            title: 'Web3 UI/UX Designer',
            company_id: 'company6',
            description: 'Design intuitive interfaces for crypto wallet apps',
            requirements: 'Figma, Web3, UX research, prototyping',
            location: 'Berlin, Germany',
            remote: true,
            salary_min: 70000,
            salary_max: 100000,
            salary_currency: 'EUR',
            blockchain_networks: ['Ethereum', 'Solana'],
            tech_stack: ['Figma', 'Sketch', 'React'],
            experience_level: 'Mid',
            employment_type: 'contract',
            posted_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company6',
              name: 'WalletWorks',
              logo_url: null,
              website: 'https://walletworks.com',
              description: 'Secure crypto wallet solutions',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: '7',
            title: 'Solidity Security Auditor',
            company_id: 'company7',
            description: 'Audit smart contracts for vulnerabilities and exploits',
            requirements: 'Solidity, security analysis, MythX, Slither',
            location: 'Remote',
            remote: true,
            salary_min: 120000,
            salary_max: 160000,
            salary_currency: 'USD',
            blockchain_networks: ['Ethereum', 'BNB Chain'],
            tech_stack: ['Solidity', 'MythX', 'Slither', 'Foundry'],
            experience_level: 'Senior',
            employment_type: 'full-time',
            posted_at: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company7',
              name: 'AuditChain',
              logo_url: null,
              website: 'https://auditchain.com',
              description: 'Smart contract security experts',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: '8',
            title: 'Crypto Community Manager',
            company_id: 'company8',
            description: 'Grow and engage the community for a new Layer 2 protocol',
            requirements: 'Social media, Discord, Twitter, crypto knowledge',
            location: 'Remote',
            remote: true,
            salary_min: 60000,
            salary_max: 90000,
            salary_currency: 'USD',
            blockchain_networks: ['Ethereum', 'Optimism'],
            tech_stack: ['Discord', 'Twitter', 'Notion'],
            experience_level: 'Junior',
            employment_type: 'full-time',
            posted_at: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company8',
              name: 'Layer2 Labs',
              logo_url: null,
              website: 'https://layer2labs.com',
              description: 'Scaling Ethereum for everyone',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          {
            id: '9',
            title: 'Web3 DevOps Engineer',
            company_id: 'company9',
            description: 'Automate deployment pipelines for blockchain infrastructure',
            requirements: 'AWS, Docker, CI/CD, blockchain nodes',
            location: 'Singapore',
            remote: false,
            salary_min: 105000,
            salary_max: 135000,
            salary_currency: 'SGD',
            blockchain_networks: ['Ethereum', 'Solana', 'Avalanche'],
            tech_stack: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
            experience_level: 'Mid',
            employment_type: 'full-time',
            posted_at: new Date(Date.now() - 691200000).toISOString(), // 8 days ago
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            companies: {
              id: 'company9',
              name: 'ChainOps',
              logo_url: null,
              website: 'https://chainops.com',
              description: 'DevOps for decentralized infrastructure',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ]

        // Filter and rank jobs based on current filters
        const rankedJobs = filterAndRankJobs(mockJobs, filters)
        setFilteredJobs(rankedJobs)
      } catch (error) {
        console.error('Error loading jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadJobs()
  }, [filters])

  const hasFilters = filters.skills?.length || filters.availableDate || filters.experienceLevel
  const bestMatches = filteredJobs.filter(js => js.score >= 60)
  const otherJobs = filteredJobs.filter(js => js.score < 60)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Personalized Header */}
      {hasFilters && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <div className="mb-4">
              <BreadcrumbNavigation
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Create Profile', href: '/profile/create' },
                  { label: 'Job Matches', current: true }
                ]}
                className="text-blue-100"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Your Personalized Job Matches
                </h1>
                <p className="text-blue-100">
                  {filters.skills?.length && (
                    <>Found {filteredJobs.length} jobs matching your {filters.skills.length} skills</>
                  )}
                  {filters.availableDate && (
                    <> • Available from {new Date(filters.availableDate).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{bestMatches.length}</div>
                <div className="text-blue-100 text-sm">Best Matches</div>
              </div>
            </div>

            {/* Selected Skills Display */}
            {filters.skills?.length && (
              <div className="mt-4">
                <div className="text-sm text-blue-100 mb-2">Your Skills:</div>
                <div className="flex flex-wrap gap-2">
                  {filters.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-white/20 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SearchAndFilters />

      {/* Job Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading personalized job matches...</p>
          </div>
        ) : (
          <>
            {/* Best Matches Section */}
            {bestMatches.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <Star className="h-6 w-6 text-yellow-500 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Best Matches ({bestMatches.length})
                  </h2>
                </div>
                <MatchedJobsList jobScores={bestMatches} showMatchScore={true} />
              </div>
            )}

            {/* Other Jobs Section */}
            {otherJobs.length > 0 && (
              <div>
                <div className="flex items-center mb-6">
                  <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Other Opportunities ({otherJobs.length})
                  </h2>
                </div>
                <MatchedJobsList jobScores={otherJobs} showMatchScore={true} />
              </div>
            )}

            {/* No Results */}
            {filteredJobs.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <TrendingUp className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No matching jobs found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or check back later for new opportunities.
                </p>
                <Link
                  href="/profile/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Your Profile
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPageContent />
    </Suspense>
  )
}
