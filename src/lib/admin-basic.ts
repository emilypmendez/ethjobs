import { supabase } from './supabase'

/**
 * Create only profiles - these have the most permissive RLS policies
 */
export async function createBasicTestData() {
  try {
    console.log('Creating basic test data (profiles only)...')
    
    // Only create profiles since they have permissive RLS policies
    const testProfiles = [
      {
        wallet_address: '0xdemo1111111111111111111111111111111111111',
        full_name: 'Demo User 1',
        skills: ['React', 'TypeScript', 'Web3'],
        bio: 'Frontend developer with Web3 experience'
      },
      {
        wallet_address: '0xdemo2222222222222222222222222222222222222',
        full_name: 'Demo User 2', 
        skills: ['Solidity', 'Smart Contracts', 'DeFi'],
        bio: 'Smart contract developer'
      },
      {
        wallet_address: '0xdemo3333333333333333333333333333333333333',
        full_name: 'Demo User 3',
        skills: ['Python', 'Backend', 'Blockchain'],
        bio: 'Backend developer interested in blockchain'
      },
      {
        wallet_address: '0xdemo4444444444444444444444444444444444444',
        full_name: 'Demo User 4',
        skills: ['JavaScript', 'Node.js', 'API'],
        bio: 'Full-stack developer'
      },
      {
        wallet_address: '0xdemo5555555555555555555555555555555555555',
        full_name: 'Demo User 5',
        skills: ['Rust', 'Systems', 'Blockchain'],
        bio: 'Systems programmer with blockchain interest'
      }
    ]
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .upsert(testProfiles, { onConflict: 'wallet_address' })
      .select()
    
    if (profilesError) {
      console.error('Error creating test profiles:', profilesError)
      return { success: false, error: profilesError.message }
    }
    
    console.log('Successfully created test profiles:', profiles?.length)
    
    return { 
      success: true, 
      error: null,
      created: {
        profiles: profiles?.length || 0
      }
    }
    
  } catch (error) {
    console.error('Error creating basic test data:', error)
    return { success: false, error: 'Failed to create basic test data' }
  }
}

/**
 * Get basic statistics from tables that definitely exist
 */
export async function getBasicDashboardStats() {
  try {
    console.log('Getting basic dashboard statistics...')
    
    // Get profile count
    const { count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (profilesError) {
      console.error('Error getting profiles count:', profilesError)
    }
    
    // Get companies count
    const { count: companiesCount, error: companiesError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
    
    if (companiesError) {
      console.error('Error getting companies count:', companiesError)
    }
    
    // Get jobs count
    const { count: jobsCount, error: jobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
    
    if (jobsError) {
      console.error('Error getting jobs count:', jobsError)
    }
    
    // Get active jobs count
    const { count: activeJobsCount, error: activeJobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    if (activeJobsError) {
      console.error('Error getting active jobs count:', activeJobsError)
    }
    
    // Get recent profiles (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentProfilesCount, error: recentProfilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)
    
    if (recentProfilesError) {
      console.error('Error getting recent profiles count:', recentProfilesError)
    }
    
    // Get recent jobs (last 7 days)
    const { count: recentJobsCount, error: recentJobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)
    
    if (recentJobsError) {
      console.error('Error getting recent jobs count:', recentJobsError)
    }
    
    const stats = {
      users: {
        total: profilesCount || 0,
        recentCount: recentProfilesCount || 0,
        growthRate: 0 // We'll calculate this when we have more data
      },
      jobs: {
        total: jobsCount || 0,
        active: activeJobsCount || 0,
        completed: 0, // We'll add this when escrow data is available
        recentCount: recentJobsCount || 0
      },
      payments: {
        totalVolume: 0, // Will be 0 until transactions table exists
        totalTransactions: 0,
        averageAmount: 0,
        recentVolume: 0
      },
      analytics: {
        pageViews: 0, // This would come from analytics service
        activeUsers: recentProfilesCount || 0,
        conversionRate: (profilesCount && jobsCount) ? (jobsCount / profilesCount) * 100 : 0
      },
      companies: {
        total: companiesCount || 0,
        verified: 0, // We'll calculate this when verification data is available
        pending: 0
      }
    }
    
    return { success: true, stats, error: null }
    
  } catch (error) {
    console.error('Error getting basic dashboard stats:', error)
    return { success: false, stats: null, error: 'Failed to get dashboard statistics' }
  }
}

/**
 * Get recent activity from available tables
 */
export async function getBasicRecentActivity() {
  try {
    console.log('Getting basic recent activity...')
    
    const activities: any[] = []
    
    // Get recent profiles
    const { data: recentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('created_at, full_name')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!profilesError && recentProfiles) {
      recentProfiles.forEach(profile => {
        activities.push({
          type: 'user_signup',
          description: `New user ${profile.full_name || 'Anonymous'} signed up`,
          timestamp: profile.created_at
        })
      })
    }
    
    // Get recent jobs
    const { data: recentJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('created_at, title, companies(name)')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!jobsError && recentJobs) {
      recentJobs.forEach(job => {
        activities.push({
          type: 'job_posted',
          description: `New job "${job.title}" posted by ${(job.companies as any)?.name || 'Unknown Company'}`,
          timestamp: job.created_at
        })
      })
    }
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return { success: true, activities: activities.slice(0, 10), error: null }
    
  } catch (error) {
    console.error('Error getting basic recent activity:', error)
    return { success: false, activities: [], error: 'Failed to get recent activity' }
  }
}

/**
 * Clear only the test data we created
 */
export async function clearBasicTestData() {
  try {
    console.log('Clearing basic test data...')
    
    // Only delete profiles with demo wallet addresses
    const { error } = await supabase
      .from('profiles')
      .delete()
      .like('wallet_address', '0xdemo%')
    
    if (error) {
      console.error('Error clearing test profiles:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Successfully cleared test data')
    return { success: true, error: null }
    
  } catch (error) {
    console.error('Error clearing basic test data:', error)
    return { success: false, error: 'Failed to clear test data' }
  }
}
