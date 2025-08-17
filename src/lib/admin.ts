import { supabase } from './supabase'
import { Profile, Job, Transaction, Company } from './database.types'

export interface AdminStats {
  users: {
    total: number
    recentCount: number
    growthRate: number
  }
  jobs: {
    total: number
    active: number
    completed: number
    recentCount: number
  }
  payments: {
    totalVolume: number
    totalTransactions: number
    averageAmount: number
    recentVolume: number
  }
  analytics: {
    pageViews: number
    activeUsers: number
    conversionRate: number
  }
  companies: {
    total: number
    verified: number
    pending: number
  }
}

export interface RecentActivity {
  type: 'user_signup' | 'job_posted' | 'payment_made' | 'company_verified'
  description: string
  timestamp: string
  amount?: number
  currency?: string
}

/**
 * Get comprehensive admin dashboard statistics
 */
export async function getAdminStats(): Promise<{ stats: AdminStats | null; error: string | null }> {
  try {
    // Get user statistics
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return { stats: null, error: profilesError.message }
    }

    // Get job statistics - only select columns that definitely exist
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('created_at, is_active')
      .order('created_at', { ascending: false })

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
      return { stats: null, error: jobsError.message }
    }

    // Skip transaction statistics - table doesn't exist yet
    const transactions: any[] = []
    console.log('Transactions table not available, using default values')

    // Get company statistics - only use basic columns that exist
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('created_at')
      .order('created_at', { ascending: false })

    if (companiesError) {
      console.error('Error fetching companies:', companiesError)
      return { stats: null, error: companiesError.message }
    }

    // Calculate statistics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // User stats
    const totalUsers = profiles?.length || 0
    const recentUsers = profiles?.filter(p => new Date(p.created_at) >= sevenDaysAgo).length || 0
    const usersThirtyDaysAgo = profiles?.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length || 0
    const userGrowthRate = usersThirtyDaysAgo > 0 ? ((totalUsers - usersThirtyDaysAgo) / usersThirtyDaysAgo) * 100 : 0

    // Job stats
    const totalJobs = jobs?.length || 0
    const activeJobs = jobs?.filter(j => j.is_active).length || 0
    const completedJobs = 0 // We'll calculate this differently when escrow_status is available
    const recentJobs = jobs?.filter(j => new Date(j.created_at) >= sevenDaysAgo).length || 0

    // Payment stats
    const totalVolume = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
    const totalTransactions = transactions?.length || 0
    const averageAmount = totalTransactions > 0 ? totalVolume / totalTransactions : 0
    const recentVolume = transactions?.filter(t => new Date(t.created_at) >= sevenDaysAgo)
      .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    // Company stats - verification columns don't exist yet
    const totalCompanies = companies?.length || 0
    const verifiedCompanies = 0 // Will be calculated when verification_status column exists
    const pendingCompanies = 0 // Will be calculated when verification_status column exists

    const stats: AdminStats = {
      users: {
        total: totalUsers,
        recentCount: recentUsers,
        growthRate: userGrowthRate
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        completed: completedJobs,
        recentCount: recentJobs
      },
      payments: {
        totalVolume,
        totalTransactions,
        averageAmount,
        recentVolume
      },
      analytics: {
        pageViews: 0, // This would come from analytics service
        activeUsers: recentUsers,
        conversionRate: totalUsers > 0 ? (activeJobs / totalUsers) * 100 : 0
      },
      companies: {
        total: totalCompanies,
        verified: verifiedCompanies,
        pending: pendingCompanies
      }
    }

    return { stats, error: null }
  } catch (error) {
    console.error('Unexpected error fetching admin stats:', error)
    return { stats: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Get recent activity for admin dashboard
 */
export async function getRecentActivity(): Promise<{ activities: RecentActivity[]; error: string | null }> {
  try {
    const activities: RecentActivity[] = []

    // Get recent user signups
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('created_at, full_name')
      .order('created_at', { ascending: false })
      .limit(5)

    recentProfiles?.forEach(profile => {
      activities.push({
        type: 'user_signup',
        description: `New user ${profile.full_name || 'Anonymous'} signed up`,
        timestamp: profile.created_at
      })
    })

    // Get recent job postings
    const { data: recentJobs } = await supabase
      .from('jobs')
      .select('created_at, title, companies(name)')
      .order('created_at', { ascending: false })
      .limit(5)

    recentJobs?.forEach(job => {
      activities.push({
        type: 'job_posted',
        description: `New job "${job.title}" posted by ${(job.companies as any)?.name || 'Unknown Company'}`,
        timestamp: job.created_at
      })
    })

    // Skip recent payments - transactions table doesn't exist yet
    console.log('Skipping transaction activity - table not available')

    // Skip company verifications - verification columns don't exist yet
    console.log('Skipping company verification activity - columns not available')

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return { activities: activities.slice(0, 10), error: null }
  } catch (error) {
    console.error('Unexpected error fetching recent activity:', error)
    return { activities: [], error: 'An unexpected error occurred' }
  }
}

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<{ health: any; error: string | null }> {
  try {
    // Test database connection
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    const health = {
      database: error ? 'error' : 'healthy',
      blockchain: 'healthy', // This would check actual blockchain connection
      pyusd: 'ready',
      lastUpdated: new Date().toISOString()
    }

    return { health, error: null }
  } catch (error) {
    console.error('Error checking system health:', error)
    return { 
      health: { 
        database: 'error', 
        blockchain: 'unknown', 
        pyusd: 'unknown',
        lastUpdated: new Date().toISOString()
      }, 
      error: 'System health check failed' 
    }
  }
}
