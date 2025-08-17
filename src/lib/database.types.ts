export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website: string | null
          description: string | null
          industry: string | null
          location: string | null
          employer_type: string | null
          wallet_address: string | null
          verification_status: string
          verification_method: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website?: string | null
          description?: string | null
          industry?: string | null
          location?: string | null
          employer_type?: string | null
          wallet_address?: string | null
          verification_status?: string
          verification_method?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website?: string | null
          description?: string | null
          industry?: string | null
          location?: string | null
          employer_type?: string | null
          wallet_address?: string | null
          verification_status?: string
          verification_method?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          title: string
          company_id: string
          description: string
          requirements: string | null
          location: string
          remote: boolean
          salary_min: number | null
          salary_max: number | null
          salary_currency: string
          blockchain_networks: string[]
          tech_stack: string[]
          experience_level: string
          employment_type: string
          job_type: string | null
          blockchain: string | null
          payment_amount: number | null
          project_deadline: string | null
          github_issue_link: string | null
          escrow_contract_address: string | null
          escrow_job_id: number | null
          escrow_status: string
          posted_at: string
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company_id: string
          description: string
          requirements?: string | null
          location: string
          remote?: boolean
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string
          blockchain_networks?: string[]
          tech_stack?: string[]
          experience_level: string
          employment_type: string
          job_type?: string | null
          blockchain?: string | null
          payment_amount?: number | null
          project_deadline?: string | null
          github_issue_link?: string | null
          escrow_contract_address?: string | null
          escrow_job_id?: number | null
          escrow_status?: string
          posted_at?: string
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company_id?: string
          description?: string
          requirements?: string | null
          location?: string
          remote?: boolean
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string
          blockchain_networks?: string[]
          tech_stack?: string[]
          experience_level?: string
          employment_type?: string
          job_type?: string | null
          blockchain?: string | null
          payment_amount?: number | null
          project_deadline?: string | null
          github_issue_link?: string | null
          escrow_contract_address?: string | null
          escrow_job_id?: number | null
          escrow_status?: string
          posted_at?: string
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          wallet_address: string | null
          email: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          skills: string[]
          experience_level: string | null
          location: string | null
          remote_preference: boolean
          available_start_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          wallet_address?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          skills?: string[]
          experience_level?: string | null
          location?: string | null
          remote_preference?: boolean
          available_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          skills?: string[]
          experience_level?: string | null
          location?: string | null
          remote_preference?: boolean
          available_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      employer_profiles: {
        Row: {
          id: string
          wallet_address: string
          company_id: string | null
          onboarding_step: number
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          pyusd_approved: boolean
          pyusd_approval_tx_hash: string | null
          pyusd_approval_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          company_id?: string | null
          onboarding_step?: number
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          pyusd_approved?: boolean
          pyusd_approval_tx_hash?: string | null
          pyusd_approval_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          company_id?: string | null
          onboarding_step?: number
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          pyusd_approved?: boolean
          pyusd_approval_tx_hash?: string | null
          pyusd_approval_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      escrow_contracts: {
        Row: {
          id: string
          job_id: string
          employer_address: string
          employee_address: string | null
          contract_address: string
          escrow_job_id: number
          amount: number
          platform_fee: number
          total_amount: number
          deadline: string
          status: string
          funded_at: string | null
          completed_at: string | null
          refunded_at: string | null
          funding_tx_hash: string | null
          completion_tx_hash: string | null
          refund_tx_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          employer_address: string
          employee_address?: string | null
          contract_address: string
          escrow_job_id: number
          amount: number
          platform_fee: number
          total_amount: number
          deadline: string
          status?: string
          funded_at?: string | null
          completed_at?: string | null
          refunded_at?: string | null
          funding_tx_hash?: string | null
          completion_tx_hash?: string | null
          refund_tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          employer_address?: string
          employee_address?: string | null
          contract_address?: string
          escrow_job_id?: number
          amount?: number
          platform_fee?: number
          total_amount?: number
          deadline?: string
          status?: string
          funded_at?: string | null
          completed_at?: string | null
          refunded_at?: string | null
          funding_tx_hash?: string | null
          completion_tx_hash?: string | null
          refund_tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          wallet_address: string
          transaction_type: string
          amount: number
          currency: string
          tx_hash: string | null
          block_number: number | null
          status: string
          job_id: string | null
          escrow_contract_id: string | null
          description: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          transaction_type: string
          amount: number
          currency?: string
          tx_hash?: string | null
          block_number?: number | null
          status?: string
          job_id?: string | null
          escrow_contract_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          transaction_type?: string
          amount?: number
          currency?: string
          tx_hash?: string | null
          block_number?: number | null
          status?: string
          job_id?: string | null
          escrow_contract_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_escrow_contract_id_fkey"
            columns: ["escrow_contract_id"]
            isOneToOne: false
            referencedRelation: "escrow_contracts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Helper types for the application
export type Job = Tables<'jobs'> & {
  companies: Tables<'companies'>
}

export type Company = Tables<'companies'>
export type Profile = Tables<'profiles'>
export type EmployerProfile = Tables<'employer_profiles'>
export type EscrowContract = Tables<'escrow_contracts'>
export type Transaction = Tables<'transactions'>

// Extended types with relationships
export type JobWithCompany = Job
export type EmployerProfileWithCompany = EmployerProfile & {
  companies: Company | null
}
export type EscrowContractWithJob = EscrowContract & {
  jobs: Job
}
