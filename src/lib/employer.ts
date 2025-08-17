import { supabase } from './supabase'
import { 
  Company, 
  EmployerProfile, 
  EscrowContract, 
  Transaction,
  Job,
  Tables
} from './database.types'

// Employer Profile Functions
export async function createEmployerProfile(walletAddress: string): Promise<EmployerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('employer_profiles')
      .insert({
        wallet_address: walletAddress,
        onboarding_step: 1,
        onboarding_completed: false,
        pyusd_approved: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating employer profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating employer profile:', error)
    return null
  }
}

export async function getEmployerProfile(walletAddress: string): Promise<EmployerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, return null
        return null
      }
      console.error('Error fetching employer profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching employer profile:', error)
    return null
  }
}

export async function updateEmployerProfile(
  walletAddress: string, 
  updates: Partial<Tables<'employer_profiles'>['Update']>
): Promise<EmployerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('employer_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single()

    if (error) {
      console.error('Error updating employer profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating employer profile:', error)
    return null
  }
}

// Company Functions
export async function createCompany(companyData: {
  name: string
  website?: string
  industry?: string
  location?: string
  employerType?: string
  walletAddress: string
}): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: companyData.name,
        website: companyData.website,
        industry: companyData.industry,
        location: companyData.location,
        employer_type: companyData.employerType,
        wallet_address: companyData.walletAddress,
        verification_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating company:', error)
    return null
  }
}

export async function updateCompanyVerification(
  companyId: string,
  verificationMethod: string
): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({
        verification_method: verificationMethod,
        verification_status: 'verified', // In demo mode, auto-verify
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single()

    if (error) {
      console.error('Error updating company verification:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating company verification:', error)
    return null
  }
}

// Job Functions
export async function createJobWithEscrow(jobData: {
  title: string
  companyId: string
  description: string
  jobType: string
  techStack: string[]
  blockchain: string
  paymentAmount: number
  projectDeadline: string
  githubIssueLink?: string
  location: string
  remote: boolean
}): Promise<Job | null> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: jobData.title,
        company_id: jobData.companyId,
        description: jobData.description,
        requirements: `Technologies: ${jobData.techStack.join(', ')}`,
        location: jobData.location,
        remote: jobData.remote,
        salary_currency: 'PYUSD',
        blockchain_networks: [jobData.blockchain],
        tech_stack: jobData.techStack,
        experience_level: 'Mid', // Default value
        employment_type: jobData.jobType,
        job_type: jobData.jobType,
        blockchain: jobData.blockchain,
        payment_amount: jobData.paymentAmount,
        project_deadline: jobData.projectDeadline,
        github_issue_link: jobData.githubIssueLink,
        escrow_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating job:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating job:', error)
    return null
  }
}

// Escrow Functions
export async function createEscrowContract(escrowData: {
  jobId: string
  employerAddress: string
  contractAddress: string
  escrowJobId: number
  amount: number
  platformFee: number
  deadline: Date
}): Promise<EscrowContract | null> {
  try {
    const { data, error } = await supabase
      .from('escrow_contracts')
      .insert({
        job_id: escrowData.jobId,
        employer_address: escrowData.employerAddress,
        contract_address: escrowData.contractAddress,
        escrow_job_id: escrowData.escrowJobId,
        amount: escrowData.amount,
        platform_fee: escrowData.platformFee,
        total_amount: escrowData.amount + escrowData.platformFee,
        deadline: escrowData.deadline.toISOString(),
        status: 'created'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating escrow contract:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating escrow contract:', error)
    return null
  }
}

export async function updateEscrowStatus(
  escrowId: string,
  status: 'funded' | 'completed' | 'refunded',
  txHash?: string
): Promise<EscrowContract | null> {
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'funded') {
      updates.funded_at = new Date().toISOString()
      updates.funding_tx_hash = txHash
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
      updates.completion_tx_hash = txHash
    } else if (status === 'refunded') {
      updates.refunded_at = new Date().toISOString()
      updates.refund_tx_hash = txHash
    }

    const { data, error } = await supabase
      .from('escrow_contracts')
      .update(updates)
      .eq('id', escrowId)
      .select()
      .single()

    if (error) {
      console.error('Error updating escrow status:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating escrow status:', error)
    return null
  }
}

// Transaction Functions
export async function createTransaction(transactionData: {
  walletAddress: string
  transactionType: 'stake' | 'payment' | 'refund' | 'escrow_fund' | 'escrow_release' | 'pyusd_approval'
  amount: number
  currency?: string
  txHash?: string
  jobId?: string
  escrowContractId?: string
  description?: string
  metadata?: any
}): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        wallet_address: transactionData.walletAddress,
        transaction_type: transactionData.transactionType,
        amount: transactionData.amount,
        currency: transactionData.currency || 'PYUSD',
        tx_hash: transactionData.txHash,
        job_id: transactionData.jobId,
        escrow_contract_id: transactionData.escrowContractId,
        description: transactionData.description,
        metadata: transactionData.metadata,
        status: transactionData.txHash ? 'completed' : 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating transaction:', error)
    return null
  }
}

export async function getTransactionsByWallet(walletAddress: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}
