-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  industry TEXT,
  location TEXT,
  employer_type TEXT CHECK (employer_type IN ('startup', 'dao', 'foundation', 'enterprise', 'protocol', 'individual')),
  wallet_address TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_method TEXT CHECK (verification_method IN ('website', 'business')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT NOT NULL,
  remote BOOLEAN DEFAULT false,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'PYUSD',
  blockchain_networks TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  experience_level TEXT NOT NULL CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Project-based', 'Bounty')),
  job_type TEXT CHECK (job_type IN ('Project-based', 'Contract', 'Part-Time', 'Full-Time', 'Bounty')),
  blockchain TEXT,
  payment_amount DECIMAL(18, 2),
  project_deadline DATE,
  github_issue_link TEXT,
  escrow_contract_address TEXT,
  escrow_job_id INTEGER,
  escrow_status TEXT DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'funded', 'completed', 'refunded')),
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')),
  location TEXT,
  remote_preference BOOLEAN DEFAULT true,
  available_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employer_profiles table
CREATE TABLE employer_profiles (
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

-- Create escrow_contracts table
CREATE TABLE escrow_contracts (
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

-- Create transactions table
CREATE TABLE transactions (
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

-- Create indexes for better performance
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_blockchain_networks ON jobs USING GIN(blockchain_networks);
CREATE INDEX idx_jobs_tech_stack ON jobs USING GIN(tech_stack);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_escrow_status ON jobs(escrow_status);
CREATE INDEX idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX idx_companies_wallet_address ON companies(wallet_address);
CREATE INDEX idx_companies_verification_status ON companies(verification_status);
CREATE INDEX idx_employer_profiles_wallet_address ON employer_profiles(wallet_address);
CREATE INDEX idx_employer_profiles_company_id ON employer_profiles(company_id);
CREATE INDEX idx_escrow_contracts_job_id ON escrow_contracts(job_id);
CREATE INDEX idx_escrow_contracts_employer_address ON escrow_contracts(employer_address);
CREATE INDEX idx_escrow_contracts_status ON escrow_contracts(status);
CREATE INDEX idx_transactions_wallet_address ON transactions(wallet_address);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_job_id ON transactions(job_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (public read)
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

-- RLS Policies for jobs (public read for active jobs)
CREATE POLICY "Active jobs are viewable by everyone" ON jobs
  FOR SELECT USING (is_active = true);

-- RLS Policies for profiles (public read, wallet-based write)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update profiles" ON profiles
  FOR UPDATE USING (true);

-- RLS Policies for employer_profiles
CREATE POLICY "Employer profiles are viewable by everyone" ON employer_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert employer profiles" ON employer_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own employer profiles" ON employer_profiles
  FOR UPDATE USING (true);

-- RLS Policies for escrow_contracts
CREATE POLICY "Escrow contracts are viewable by everyone" ON escrow_contracts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert escrow contracts" ON escrow_contracts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update escrow contracts" ON escrow_contracts
  FOR UPDATE USING (true);

-- RLS Policies for transactions
CREATE POLICY "Transactions are viewable by everyone" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update transactions" ON transactions
  FOR UPDATE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO companies (id, name, logo_url, website, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'defiprotocol.eth', null, 'https://defiprotocol.eth', 'Leading DeFi protocol building the future of decentralized finance'),
  ('550e8400-e29b-41d4-a716-446655440002', 'MetaVerse Studios', null, 'https://metaversestudios.com', 'Creating immersive Web3 experiences and virtual worlds'),
  ('550e8400-e29b-41d4-a716-446655440003', 'chaininfra.eth', null, 'https://chaininfra.eth', 'Blockchain infrastructure and DevOps solutions');

INSERT INTO jobs (title, company_id, description, requirements, location, remote, salary_min, salary_max, blockchain_networks, tech_stack, experience_level, employment_type) VALUES
  (
    'Senior Solidity Developer',
    '550e8400-e29b-41d4-a716-446655440001',
    'We are looking for an experienced Solidity developer to join our core protocol team. You will be responsible for designing, implementing, and auditing smart contracts that handle millions of dollars in TVL.',
    'Strong experience with Solidity, Hardhat, and DeFi protocols. Knowledge of gas optimization and security best practices required.',
    'Remote',
    true,
    120000,
    180000,
    ARRAY['Ethereum'],
    ARRAY['Solidity', 'DeFi', 'Web3'],
    'Senior',
    'Full-time'
  ),
  (
    'Frontend Web3 Engineer',
    '550e8400-e29b-41d4-a716-446655440002',
    'Join our frontend team to build cutting-edge Web3 applications. You will work on user interfaces that connect users to blockchain networks and create seamless Web3 experiences.',
    'Experience with React, TypeScript, and Web3 libraries like wagmi or ethers.js. Knowledge of wallet integration and blockchain interactions.',
    'San Francisco',
    false,
    100000,
    150000,
    ARRAY['Polygon'],
    ARRAY['React', 'Web3.js', 'TypeScript'],
    'Mid',
    'Full-time'
  ),
  (
    'DevOps Engineer - Blockchain',
    '550e8400-e29b-41d4-a716-446655440003',
    'We need a DevOps engineer with blockchain expertise to manage our infrastructure. You will be responsible for node operations, monitoring, and deployment pipelines.',
    'Experience with Kubernetes, AWS, and blockchain node operations. Knowledge of monitoring tools and CI/CD pipelines.',
    'Remote',
    true,
    90000,
    130000,
    ARRAY['Ethereum', 'Polygon', 'Arbitrum'],
    ARRAY['DevOps', 'Kubernetes', 'AWS'],
    'Senior',
    'Full-time'
  );
