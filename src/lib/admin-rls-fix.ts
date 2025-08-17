import { supabase } from './supabase'

/**
 * Fix RLS policies for admin operations
 * This adds missing INSERT/DELETE policies for companies and jobs tables
 */
export async function fixRLSPolicies() {
  try {
    console.log('Checking and fixing RLS policies...')

    // Try to create missing RLS policies for companies and jobs
    const { error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          -- Add missing INSERT policy for companies
          CREATE POLICY IF NOT EXISTS "Users can insert companies" ON companies
            FOR INSERT WITH CHECK (true);

          -- Add missing INSERT policy for jobs
          CREATE POLICY IF NOT EXISTS "Users can insert jobs" ON jobs
            FOR INSERT WITH CHECK (true);

          -- Add missing UPDATE policy for jobs
          CREATE POLICY IF NOT EXISTS "Users can update jobs" ON jobs
            FOR UPDATE USING (true);

          -- Add missing DELETE policy for jobs
          CREATE POLICY IF NOT EXISTS "Users can delete jobs" ON jobs
            FOR DELETE USING (true);

          -- Add missing DELETE policy for companies
          CREATE POLICY IF NOT EXISTS "Users can delete companies" ON companies
            FOR DELETE USING (true);
        `
      })

    if (policyError) {
      console.log('Could not create RLS policies (this is normal if exec_sql is not available):', policyError.message)
      return { success: false, error: 'Cannot create RLS policies - exec_sql function not available. You may need to run these SQL commands manually in your database.' }
    }

    console.log('RLS policies fixed successfully!')
    return { success: true, error: null }

  } catch (error) {
    console.error('Error fixing RLS policies:', error)
    return { success: false, error: 'Failed to fix RLS policies' }
  }
}

/**
 * Alternative seeding approach using existing sample data
 */
export async function seedWithExistingData() {
  try {
    console.log('Attempting to seed using existing sample data...')
    
    // Check if there's already sample data in the database
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('*')
      .limit(5)
    
    const { data: existingJobs } = await supabase
      .from('jobs')
      .select('*')
      .limit(5)
    
    console.log('Found existing companies:', existingCompanies?.length || 0)
    console.log('Found existing jobs:', existingJobs?.length || 0)
    
    if (existingCompanies && existingCompanies.length > 0) {
      console.log('Sample companies already exist:', existingCompanies.map(c => c.name))
    }
    
    if (existingJobs && existingJobs.length > 0) {
      console.log('Sample jobs already exist:', existingJobs.map(j => j.title))
    }
    
    // Create some profiles if they don't exist
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('wallet_address')
      .limit(3)
    
    if (!existingProfiles || existingProfiles.length === 0) {
      console.log('Creating sample profiles...')
      
      const sampleProfiles = [
        {
          wallet_address: '0x1111111111111111111111111111111111111111',
          full_name: 'Demo Developer 1',
          skills: ['React', 'TypeScript', 'Solidity']
        },
        {
          wallet_address: '0x2222222222222222222222222222222222222222',
          full_name: 'Demo Developer 2',
          skills: ['Python', 'Web3', 'DeFi']
        },
        {
          wallet_address: '0x3333333333333333333333333333333333333333',
          full_name: 'Demo Developer 3',
          skills: ['JavaScript', 'React', 'Blockchain']
        }
      ]
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .upsert(sampleProfiles, { onConflict: 'wallet_address' })
        .select()
      
      if (profilesError) {
        console.error('Error creating profiles:', profilesError)
      } else {
        console.log('Created profiles:', profiles?.length)
      }
    }
    
    // Create some sample transactions
    const { data: existingTransactions } = await supabase
      .from('transactions')
      .select('id')
      .limit(3)
    
    if (!existingTransactions || existingTransactions.length === 0) {
      console.log('Creating sample transactions...')
      
      const sampleTransactions = [
        {
          wallet_address: '0x1111111111111111111111111111111111111111',
          transaction_type: 'stake',
          amount: 1000,
          status: 'completed'
        },
        {
          wallet_address: '0x2222222222222222222222222222222222222222',
          transaction_type: 'payment',
          amount: 5000,
          status: 'completed'
        },
        {
          wallet_address: '0x3333333333333333333333333333333333333333',
          transaction_type: 'escrow_fund',
          amount: 10000,
          status: 'pending'
        }
      ]
      
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .insert(sampleTransactions)
        .select()
      
      if (transactionsError) {
        console.error('Error creating transactions:', transactionsError)
      } else {
        console.log('Created transactions:', transactions?.length)
      }
    }
    
    return { success: true, error: null }
    
  } catch (error) {
    console.error('Error seeding with existing data:', error)
    return { success: false, error: 'Failed to seed with existing data' }
  }
}
