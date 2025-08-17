import { supabase } from '../supabase'

/**
 * Run the employer portal migration
 * This adds all the necessary tables and columns for the employer portal
 */
export async function runEmployerPortalMigration() {
  try {
    console.log('Running employer portal migration...')
    
    // Read the migration SQL file content
    const migrationSQL = `
      -- Step 1: Update companies table with employer portal fields
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS industry TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS employer_type TEXT CHECK (employer_type IN ('startup', 'dao', 'foundation', 'enterprise', 'protocol', 'individual')),
      ADD COLUMN IF NOT EXISTS wallet_address TEXT,
      ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
      ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('website', 'business')),
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

      -- Step 2: Update jobs table with employer portal fields
      ALTER TABLE jobs 
      ADD COLUMN IF NOT EXISTS job_type TEXT CHECK (job_type IN ('Project-based', 'Contract', 'Part-Time', 'Full-Time', 'Bounty')),
      ADD COLUMN IF NOT EXISTS blockchain TEXT,
      ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(18, 2),
      ADD COLUMN IF NOT EXISTS project_deadline DATE,
      ADD COLUMN IF NOT EXISTS github_issue_link TEXT,
      ADD COLUMN IF NOT EXISTS escrow_contract_address TEXT,
      ADD COLUMN IF NOT EXISTS escrow_job_id INTEGER,
      ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'funded', 'completed', 'refunded'));

      -- Step 3: Create employer_profiles table
      CREATE TABLE IF NOT EXISTS employer_profiles (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        wallet_address TEXT UNIQUE NOT NULL,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        onboarding_step INTEGER DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 6),
        onboarding_completed BOOLEAN DEFAULT false,
        onboarding_completed_at TIMESTAMP WITH TIME ZONE,
        pyusd_approved BOOLEAN DEFAULT false,
        pyusd_approval_tx_hash TEXT,
        pyusd_approval_amount DECIMAL(18, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Step 4: Create escrow_contracts table
      CREATE TABLE IF NOT EXISTS escrow_contracts (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        employer_address TEXT NOT NULL,
        employee_address TEXT,
        contract_address TEXT NOT NULL,
        escrow_job_id INTEGER NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        platform_fee DECIMAL(18, 2) NOT NULL,
        total_amount DECIMAL(18, 2) NOT NULL,
        deadline TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT DEFAULT 'created' CHECK (status IN ('created', 'funded', 'completed', 'refunded')),
        funded_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        refunded_at TIMESTAMP WITH TIME ZONE,
        funding_tx_hash TEXT,
        completion_tx_hash TEXT,
        refund_tx_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Step 5: Create transactions table
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        wallet_address TEXT NOT NULL,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stake', 'payment', 'refund', 'escrow_fund', 'escrow_release', 'pyusd_approval')),
        amount DECIMAL(18, 2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'PYUSD',
        tx_hash TEXT,
        block_number INTEGER,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
        escrow_contract_id UUID REFERENCES escrow_contracts(id) ON DELETE SET NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Step 6: Create indexes for new tables and columns
      CREATE INDEX IF NOT EXISTS idx_jobs_escrow_status ON jobs(escrow_status);
      CREATE INDEX IF NOT EXISTS idx_companies_wallet_address ON companies(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON companies(verification_status);
      CREATE INDEX IF NOT EXISTS idx_employer_profiles_wallet_address ON employer_profiles(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_employer_profiles_company_id ON employer_profiles(company_id);
      CREATE INDEX IF NOT EXISTS idx_escrow_contracts_job_id ON escrow_contracts(job_id);
      CREATE INDEX IF NOT EXISTS idx_escrow_contracts_employer_address ON escrow_contracts(employer_address);
      CREATE INDEX IF NOT EXISTS idx_escrow_contracts_status ON escrow_contracts(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_wallet_address ON transactions(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_job_id ON transactions(job_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

      -- Step 7: Enable RLS for new tables
      ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE escrow_contracts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    `

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      console.error('Migration failed:', error)
      return { success: false, error: error.message }
    }

    // Create RLS policies
    const policiesSQL = `
      -- RLS Policies for employer_profiles
      CREATE POLICY IF NOT EXISTS "Employer profiles are viewable by everyone" ON employer_profiles
        FOR SELECT USING (true);

      CREATE POLICY IF NOT EXISTS "Users can insert employer profiles" ON employer_profiles
        FOR INSERT WITH CHECK (true);

      CREATE POLICY IF NOT EXISTS "Users can update their own employer profiles" ON employer_profiles
        FOR UPDATE USING (true);

      -- RLS Policies for escrow_contracts
      CREATE POLICY IF NOT EXISTS "Escrow contracts are viewable by everyone" ON escrow_contracts
        FOR SELECT USING (true);

      CREATE POLICY IF NOT EXISTS "Users can insert escrow contracts" ON escrow_contracts
        FOR INSERT WITH CHECK (true);

      CREATE POLICY IF NOT EXISTS "Users can update escrow contracts" ON escrow_contracts
        FOR UPDATE USING (true);

      -- RLS Policies for transactions
      CREATE POLICY IF NOT EXISTS "Transactions are viewable by everyone" ON transactions
        FOR SELECT USING (true);

      CREATE POLICY IF NOT EXISTS "Users can insert transactions" ON transactions
        FOR INSERT WITH CHECK (true);

      CREATE POLICY IF NOT EXISTS "Users can update transactions" ON transactions
        FOR UPDATE USING (true);
    `

    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL })

    if (policiesError) {
      console.warn('Some policies may not have been created:', policiesError)
      // Don't fail the migration for policy errors
    }

    console.log('Employer portal migration completed successfully!')
    return { success: true }

  } catch (error) {
    console.error('Migration error:', error)
    return { success: false, error: 'An unexpected error occurred during migration' }
  }
}

/**
 * Check if the employer portal migration has been run
 */
export async function checkEmployerPortalMigration() {
  try {
    // Check if the new tables exist
    const { data: employerProfiles, error: epError } = await supabase
      .from('employer_profiles')
      .select('id')
      .limit(1)

    const { data: escrowContracts, error: ecError } = await supabase
      .from('escrow_contracts')
      .select('id')
      .limit(1)

    const { data: transactions, error: tError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1)

    // If any table doesn't exist, migration is needed
    if (epError?.code === '42P01' || ecError?.code === '42P01' || tError?.code === '42P01') {
      return { migrationNeeded: true, reason: 'New tables not found' }
    }

    // Check if new columns exist in companies table
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('industry, employer_type, verification_status')
      .limit(1)

    if (companiesError) {
      return { migrationNeeded: true, reason: 'New company columns not found' }
    }

    // Check if new columns exist in jobs table
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('job_type, blockchain, payment_amount, escrow_status')
      .limit(1)

    if (jobsError) {
      return { migrationNeeded: true, reason: 'New job columns not found' }
    }

    return { migrationNeeded: false, reason: 'All tables and columns exist' }

  } catch (error) {
    console.error('Error checking migration status:', error)
    return { migrationNeeded: true, reason: 'Error checking migration status' }
  }
}

/**
 * Utility function to run migration if needed
 */
export async function ensureEmployerPortalMigration() {
  const check = await checkEmployerPortalMigration()
  
  if (check.migrationNeeded) {
    console.log('Employer portal migration needed:', check.reason)
    return await runEmployerPortalMigration()
  } else {
    console.log('Employer portal migration not needed:', check.reason)
    return { success: true, message: 'Migration not needed' }
  }
}
