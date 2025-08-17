import { supabase } from './supabase'

export interface ActivitySummary {
  completedProjects: number
  currentProjects: number
  totalEarnings: number
  recentTransactions: Array<{
    id: string
    amount: number
    hash: string
    date: string
    type: 'payment' | 'escrow' | 'milestone'
    projectTitle?: string
  }>
  savedJobs: Array<{
    id: string
    title: string
    company: string
    savedAt: string
    salary?: string
    location?: string
  }>
}

export interface WorkHistoryBadge {
  id: string
  projectTitle: string
  completionDate: string
  nftImageUrl?: string
  employer: string
  skills: string[]
  description?: string
  contractAddress?: string
  tokenId?: string
}

/**
 * Get user activity summary from database
 */
export async function getUserActivitySummary(walletAddress: string): Promise<{
  activitySummary: ActivitySummary | null
  error: string | null
}> {
  try {
    // TODO: Implement real database queries
    // For now, return mock data
    const mockActivitySummary: ActivitySummary = {
      completedProjects: 12,
      currentProjects: 3,
      totalEarnings: 45000,
      recentTransactions: [
        { 
          id: '1', 
          amount: 2500, 
          hash: '0x1234567890abcdef1234567890abcdef12345678', 
          date: '2024-01-15',
          type: 'payment',
          projectTitle: 'DeFi Trading Platform'
        },
        { 
          id: '2', 
          amount: 1800, 
          hash: '0x9abcdef01234567890abcdef01234567890abcdef', 
          date: '2024-01-10',
          type: 'milestone',
          projectTitle: 'NFT Marketplace Frontend'
        },
        { 
          id: '3', 
          amount: 3200, 
          hash: '0x567890abcdef1234567890abcdef1234567890ab', 
          date: '2024-01-05',
          type: 'payment',
          projectTitle: 'Smart Contract Audit'
        }
      ],
      savedJobs: [
        { 
          id: '1', 
          title: 'Senior Frontend Developer', 
          company: 'DeFi Protocol', 
          savedAt: '2024-01-16',
          salary: '$80k - $120k',
          location: 'Remote'
        },
        { 
          id: '2', 
          title: 'Smart Contract Developer', 
          company: 'Web3 Startup', 
          savedAt: '2024-01-14',
          salary: '$90k - $140k',
          location: 'San Francisco, CA'
        },
        { 
          id: '3', 
          title: 'Full Stack Engineer', 
          company: 'DAO Foundation', 
          savedAt: '2024-01-12',
          salary: '$70k - $110k',
          location: 'Remote'
        }
      ]
    }

    return { activitySummary: mockActivitySummary, error: null }
  } catch (error) {
    console.error('Error fetching user activity summary:', error)
    return { 
      activitySummary: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch activity summary' 
    }
  }
}

/**
 * Get user work history badges (NFT achievements)
 */
export async function getUserWorkHistoryBadges(walletAddress: string): Promise<{
  badges: WorkHistoryBadge[]
  error: string | null
}> {
  try {
    // TODO: Implement real database queries and NFT contract integration
    // For now, return mock data
    const mockBadges: WorkHistoryBadge[] = [
      {
        id: '1',
        projectTitle: 'DeFi Trading Platform',
        completionDate: '2024-01-10',
        employer: 'Uniswap Labs',
        skills: ['React', 'TypeScript', 'Web3.js', 'DeFi'],
        description: 'Built a comprehensive DeFi trading platform with advanced analytics',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        tokenId: '1'
      },
      {
        id: '2',
        projectTitle: 'NFT Marketplace Frontend',
        completionDate: '2023-12-15',
        employer: 'OpenSea',
        skills: ['Next.js', 'Solidity', 'IPFS', 'NFTs'],
        description: 'Developed the frontend for a next-generation NFT marketplace',
        contractAddress: '0x9abcdef01234567890abcdef01234567890abcdef',
        tokenId: '2'
      },
      {
        id: '3',
        projectTitle: 'Smart Contract Audit',
        completionDate: '2023-11-20',
        employer: 'Consensys',
        skills: ['Solidity', 'Security', 'Testing', 'Auditing'],
        description: 'Conducted comprehensive security audit of DeFi protocol smart contracts',
        contractAddress: '0x567890abcdef1234567890abcdef1234567890ab',
        tokenId: '3'
      },
      {
        id: '4',
        projectTitle: 'Cross-Chain Bridge',
        completionDate: '2023-10-05',
        employer: 'Polygon',
        skills: ['Rust', 'Blockchain', 'Cross-chain', 'Security'],
        description: 'Implemented secure cross-chain asset bridge with multi-sig validation',
        contractAddress: '0xcdef1234567890abcdef1234567890abcdef1234',
        tokenId: '4'
      },
      {
        id: '5',
        projectTitle: 'DAO Governance Tools',
        completionDate: '2023-09-12',
        employer: 'Compound',
        skills: ['JavaScript', 'DAO', 'Governance', 'Web3'],
        description: 'Built comprehensive DAO governance and proposal management tools',
        contractAddress: '0xef1234567890abcdef1234567890abcdef123456',
        tokenId: '5'
      },
      {
        id: '6',
        projectTitle: 'Yield Farming Protocol',
        completionDate: '2023-08-18',
        employer: 'Yearn Finance',
        skills: ['Solidity', 'DeFi', 'Yield Farming', 'Smart Contracts'],
        description: 'Developed automated yield farming strategies with risk management',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        tokenId: '6'
      }
    ]

    return { badges: mockBadges, error: null }
  } catch (error) {
    console.error('Error fetching work history badges:', error)
    return { 
      badges: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch work history badges' 
    }
  }
}

/**
 * Save a job for later viewing
 */
export async function saveJob(walletAddress: string, jobId: string): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    // TODO: Implement real database operation
    // For now, just return success
    console.log(`Saving job ${jobId} for user ${walletAddress}`)
    return { success: true, error: null }
  } catch (error) {
    console.error('Error saving job:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save job' 
    }
  }
}

/**
 * Remove a saved job
 */
export async function removeSavedJob(walletAddress: string, jobId: string): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    // TODO: Implement real database operation
    // For now, just return success
    console.log(`Removing saved job ${jobId} for user ${walletAddress}`)
    return { success: true, error: null }
  } catch (error) {
    console.error('Error removing saved job:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove saved job' 
    }
  }
}

/**
 * Calculate profile completion score
 */
export function calculateProfileScore(profile: any): number {
  let score = 0
  const maxScore = 100

  // Basic info (30 points)
  if (profile.full_name) score += 10
  if (profile.bio) score += 10
  if (profile.location) score += 10

  // Skills and experience (40 points)
  if (profile.skills && profile.skills.length > 0) score += 20
  if (profile.experience_level) score += 10
  if (profile.available_start_date) score += 10

  // Additional info (30 points)
  if (profile.email) score += 10
  // GitHub integration would add 10 points
  // Portfolio URL would add 10 points

  return Math.min(score, maxScore)
}

/**
 * Get profile completion suggestions
 */
export function getProfileCompletionSuggestions(profile: any): string[] {
  const suggestions: string[] = []

  if (!profile.full_name) suggestions.push('Add your full name')
  if (!profile.bio) suggestions.push('Write a professional bio')
  if (!profile.location) suggestions.push('Add your location')
  if (!profile.skills || profile.skills.length === 0) suggestions.push('Add your technical skills')
  if (!profile.experience_level) suggestions.push('Set your experience level')
  if (!profile.available_start_date) suggestions.push('Set your availability date')
  if (!profile.email) suggestions.push('Add your email address')

  return suggestions
}
