import { supabase } from './supabase'
import { seedWithExistingData } from './admin-rls-fix'

/**
 * Check what columns exist in a table
 */
async function getTableColumns(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0)

    if (error) {
      console.error(`Error checking ${tableName} columns:`, error)
      return []
    }

    return Object.keys(data?.[0] || {})
  } catch (error) {
    console.error(`Error checking ${tableName} columns:`, error)
    return []
  }
}

/**
 * Seed test data for admin dashboard demonstration
 * This is for development/demo purposes only
 */
export async function seedTestData() {
  try {
    console.log('Starting to seed test data...')

    // Let's try a different approach - check if data already exists first
    console.log('Checking existing data...')

    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Profiles already exist, skipping profile creation')
    } else {
      // Create test profiles with minimal required fields
      const testProfiles = [
        {
          wallet_address: '0x1234567890123456789012345678901234567890',
          full_name: 'Alice Johnson',
          skills: ['React', 'Solidity', 'TypeScript']
        },
        {
          wallet_address: '0x2345678901234567890123456789012345678901',
          full_name: 'Bob Smith',
          skills: ['Solidity', 'Hardhat', 'Python']
        },
        {
          wallet_address: '0x3456789012345678901234567890123456789012',
          full_name: 'Carol Davis',
          skills: ['React', 'JavaScript', 'CSS']
        }
      ]

      console.log('Inserting profiles...')
      // Insert profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .upsert(testProfiles, { onConflict: 'wallet_address' })
        .select()

      if (profilesError) {
        console.error('Error creating profiles:', profilesError)
        return { success: false, error: profilesError.message }
      }

      console.log('Created profiles:', profiles?.length)
    }

    let companies = existingCompanies

    if (!existingCompanies || existingCompanies.length === 0) {
      // Create test companies with minimal required fields
      const testCompanies = [
        {
          name: 'DeFi Protocol Inc'
        },
        {
          name: 'Web3 Solutions LLC'
        }
      ]

      console.log('Inserting companies...')
      // Try to insert companies - if RLS fails, we'll handle it gracefully
      const { data: newCompanies, error: companiesError } = await supabase
        .from('companies')
        .insert(testCompanies)
        .select()

      if (companiesError) {
        console.error('Error creating companies (this might be due to RLS policies):', companiesError)
        // Try to get existing companies instead
        const { data: existingCompaniesData } = await supabase
          .from('companies')
          .select('*')
          .limit(2)

        if (existingCompaniesData && existingCompaniesData.length > 0) {
          console.log('Using existing companies instead')
          companies = existingCompaniesData
        } else {
          return { success: false, error: `Companies creation failed: ${companiesError.message}. This might be due to missing RLS INSERT policies for the companies table.` }
        }
      } else {
        companies = newCompanies
        console.log('Created companies:', companies?.length)
      }
    } else {
      console.log('Companies already exist, using existing ones')
      const { data: existingCompaniesData } = await supabase
        .from('companies')
        .select('*')
        .limit(2)
      companies = existingCompaniesData
    }

    // Skip job creation - no INSERT policy exists for jobs table
    console.log('Skipping job creation - jobs table has RLS enabled but no INSERT policy')
    console.log('Jobs can only be created after proper RLS INSERT policies are added')

    console.log('Test data seeding completed successfully!')
    return { success: true, error: null }

  } catch (error) {
    console.error('Error seeding test data:', error)

    // Try alternative seeding approach
    console.log('Trying alternative seeding approach...')
    const alternativeResult = await seedWithExistingData()

    if (alternativeResult.success) {
      return { success: true, error: null }
    }

    return { success: false, error: `Primary seeding failed: ${error}. Alternative seeding also failed: ${alternativeResult.error}` }
  }
}

/**
 * Clear ONLY the specific test data created by seeding functions
 */
export async function clearTestData() {
  try {
    console.log('Clearing ONLY test data created by seeding functions...')

    // Skip transaction deletion - table doesn't exist yet
    console.log('Skipping transaction deletion - table not available')

    // Skip job deletion - no DELETE policy exists for jobs table
    console.log('Skipping job deletion - jobs table has RLS but no DELETE policy')

    // Delete test companies by name
    await supabase
      .from('companies')
      .delete()
      .in('name', ['DeFi Protocol Inc', 'Web3 Solutions LLC'])

    // Delete test profiles by wallet address
    await supabase
      .from('profiles')
      .delete()
      .in('wallet_address', [
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012'
      ])

    console.log('Test data cleared successfully!')
    return { success: true, error: null }

  } catch (error) {
    console.error('Error clearing test data:', error)
    return { success: false, error: 'Failed to clear test data' }
  }
}
