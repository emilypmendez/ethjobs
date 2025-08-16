-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
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
  employment_type TEXT NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship')),
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')),
  location TEXT,
  remote_preference BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_blockchain_networks ON jobs USING GIN(blockchain_networks);
CREATE INDEX idx_jobs_tech_stack ON jobs USING GIN(tech_stack);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_profiles_wallet_address ON profiles(wallet_address);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (public read)
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

-- RLS Policies for jobs (public read for active jobs)
CREATE POLICY "Active jobs are viewable by everyone" ON jobs
  FOR SELECT USING (is_active = true);

-- RLS Policies for profiles (users can only see/edit their own profile)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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
