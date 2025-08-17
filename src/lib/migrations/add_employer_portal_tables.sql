-- Migration: Add Employer Portal Support
-- This migration adds tables and columns to support the employer onboarding portal

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

-- Update employment_type constraint to include new types
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_employment_type_check 
  CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Project-based', 'Bounty'));

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

-- Step 8: Create RLS policies for new tables
-- Employer profiles policies
CREATE POLICY IF NOT EXISTS "Employer profiles are viewable by everyone" ON employer_profiles
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert employer profiles" ON employer_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update their own employer profiles" ON employer_profiles
  FOR UPDATE USING (true);

-- Escrow contracts policies
CREATE POLICY IF NOT EXISTS "Escrow contracts are viewable by everyone" ON escrow_contracts
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert escrow contracts" ON escrow_contracts
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update escrow contracts" ON escrow_contracts
  FOR UPDATE USING (true);

-- Transactions policies
CREATE POLICY IF NOT EXISTS "Transactions are viewable by everyone" ON transactions
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update transactions" ON transactions
  FOR UPDATE USING (true);

-- Step 9: Add comments for documentation
COMMENT ON TABLE employer_profiles IS 'Tracks employer onboarding progress and PYUSD approval status';
COMMENT ON TABLE escrow_contracts IS 'Tracks escrow contract details and status for job payments';
COMMENT ON TABLE transactions IS 'Records all blockchain transactions related to jobs and escrow';

COMMENT ON COLUMN companies.industry IS 'Industry category for the company';
COMMENT ON COLUMN companies.employer_type IS 'Type of employer (startup, DAO, etc.)';
COMMENT ON COLUMN companies.verification_status IS 'Company verification status';
COMMENT ON COLUMN jobs.job_type IS 'Type of job posting';
COMMENT ON COLUMN jobs.payment_amount IS 'Payment amount in PYUSD';
COMMENT ON COLUMN jobs.escrow_status IS 'Status of escrow funding for this job';
COMMENT ON COLUMN employer_profiles.onboarding_step IS 'Current step in employer onboarding (1-6)';
COMMENT ON COLUMN escrow_contracts.platform_fee IS 'Platform fee (typically 2% of amount)';
COMMENT ON COLUMN transactions.transaction_type IS 'Type of blockchain transaction';
