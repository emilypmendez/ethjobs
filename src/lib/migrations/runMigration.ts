import { supabase } from '../supabase'

/**
 * Run the migration to add available_start_date column
 */
export async function addAvailableStartDateColumn() {
  try {
    console.log('Running migration: Add available_start_date column...')
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS available_start_date DATE;
        
        COMMENT ON COLUMN profiles.available_start_date IS 'The date when the user is available to start new projects';
      `
    })

    if (error) {
      console.error('Migration failed:', error)
      return { success: false, error: error.message }
    }

    console.log('Migration completed successfully!')
    return { success: true, error: null }
  } catch (error) {
    console.error('Migration error:', error)
    return { success: false, error: 'An unexpected error occurred during migration' }
  }
}

/**
 * Alternative method using direct SQL execution
 * Use this if the RPC method doesn't work
 */
export async function addAvailableStartDateColumnDirect() {
  try {
    console.log('Running direct migration: Add available_start_date column...')
    
    // First check if column already exists
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('column_name', 'available_start_date')

    if (checkError) {
      console.error('Error checking column existence:', checkError)
      return { success: false, error: checkError.message }
    }

    if (columns && columns.length > 0) {
      console.log('Column available_start_date already exists')
      return { success: true, error: null }
    }

    // If column doesn't exist, we need to add it via SQL
    // Note: This requires database admin access
    console.log('Column does not exist. Please run the following SQL in your Supabase SQL editor:')
    console.log(`
      ALTER TABLE profiles 
      ADD COLUMN available_start_date DATE;
      
      COMMENT ON COLUMN profiles.available_start_date IS 'The date when the user is available to start new projects';
    `)

    return { 
      success: false, 
      error: 'Column needs to be added manually. Please run the SQL shown in the console in your Supabase SQL editor.' 
    }
  } catch (error) {
    console.error('Migration error:', error)
    return { success: false, error: 'An unexpected error occurred during migration check' }
  }
}
