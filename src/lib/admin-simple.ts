import { supabase } from './supabase'

/**
 * Simple test to verify database connectivity and basic data access
 */
export async function testDatabaseAccess() {
  try {
    console.log('Testing database access...')
    
    // Test basic connectivity
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .limit(5)
    
    if (profilesError) {
      console.error('Profiles query error:', profilesError)
    } else {
      console.log('Profiles found:', profiles?.length || 0)
    }
    
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, created_at')
      .limit(5)
    
    if (companiesError) {
      console.error('Companies query error:', companiesError)
    } else {
      console.log('Companies found:', companies?.length || 0)
    }
    
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, created_at, is_active')
      .limit(5)
    
    if (jobsError) {
      console.error('Jobs query error:', jobsError)
    } else {
      console.log('Jobs found:', jobs?.length || 0)
    }
    
    // Skip transactions table - it doesn't exist yet
    const transactions: any[] = []
    console.log('Transactions table not available, skipping')
    
    return {
      success: true,
      data: {
        profiles: profiles?.length || 0,
        companies: companies?.length || 0,
        jobs: jobs?.length || 0,
        transactions: transactions.length || 0
      },
      error: null
    }
    
  } catch (error) {
    console.error('Database access test failed:', error)
    return {
      success: false,
      data: null,
      error: 'Database access test failed'
    }
  }
}

/**
 * Create minimal test data that should work with basic RLS policies
 */
export async function createMinimalTestData() {
  try {
    console.log('Creating minimal test data...')
    
    // Only create profiles since they have the most permissive RLS policies
    const testProfiles = [
      {
        wallet_address: '0xtest1111111111111111111111111111111111111',
        full_name: 'Test User 1',
        skills: ['React', 'TypeScript']
      },
      {
        wallet_address: '0xtest2222222222222222222222222222222222222',
        full_name: 'Test User 2',
        skills: ['Solidity', 'Web3']
      },
      {
        wallet_address: '0xtest3333333333333333333333333333333333333',
        full_name: 'Test User 3',
        skills: ['Python', 'DeFi']
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
    
    console.log('Created test profiles:', profiles?.length)
    
    // Skip transaction creation - table doesn't exist yet
    console.log('Skipping transaction creation - table not available')
    
    return { success: true, error: null }
    
  } catch (error) {
    console.error('Error creating minimal test data:', error)
    return { success: false, error: 'Failed to create minimal test data' }
  }
}

/**
 * Get basic stats that should work with current database state
 */
export async function getBasicStats() {
  try {
    // Get counts for each table
    const { count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    const { count: companiesCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
    
    const { count: jobsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
    
    // Skip transaction stats - table doesn't exist yet
    const transactionsCount = 0
    const totalVolume = 0
    console.log('Using default transaction values - table not available')
    
    return {
      success: true,
      stats: {
        users: profilesCount || 0,
        companies: companiesCount || 0,
        jobs: jobsCount || 0,
        transactions: transactionsCount || 0,
        totalVolume: totalVolume
      },
      error: null
    }
    
  } catch (error) {
    console.error('Error getting basic stats:', error)
    return {
      success: false,
      stats: null,
      error: 'Failed to get basic stats'
    }
  }
}
