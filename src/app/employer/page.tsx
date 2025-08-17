'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import EmployerProgressIndicator from '@/components/employer/EmployerProgressIndicator'
import ConnectWalletStep from '@/components/employer/steps/ConnectWalletStep'
import CompanyProfileStep from '@/components/employer/steps/CompanyProfileStep'
import CompanyVerificationStep from '@/components/employer/steps/CompanyVerificationStep'
import CreateJobStep from '@/components/employer/steps/CreateJobStep'
import ApprovePYUSDStep from '@/components/employer/steps/ApprovePYUSDStep'
import FundEscrowStep from '@/components/employer/steps/FundEscrowStep'
import Header from '@/components/ui/Header'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export interface EmployerFormData {
  // Company Profile
  companyName: string
  website: string
  industry: string
  location: string
  employerType: string
  
  // Job Details
  jobTitle: string
  jobType: string
  jobDescription: string
  techStack: string[]
  blockchain: string
  paymentAmount: number
  projectDeadline: string
  githubIssueLink: string
  
  // Verification & Escrow
  verificationMethod: string
  isWalletVerified: boolean
  isCompanyVerified: boolean
  isEscrowSetup: boolean
  pyusdApproved: boolean
  escrowFunded: boolean
}

const EMPLOYER_STEPS = [
  { id: 'connect-wallet', title: 'Connect Wallet', description: 'Connect your crypto wallet' },
  { id: 'company-profile', title: 'Company Profile', description: 'Enter company information' },
  { id: 'verification', title: 'Verification', description: 'Verify your company' },
  { id: 'create-job', title: 'Create Job', description: 'Post your job details' },
  { id: 'approve-pyusd', title: 'Approve PYUSD', description: 'Approve token spending' },
  { id: 'fund-escrow', title: 'Fund Escrow', description: 'Fund the escrow contract' }
]

export default function EmployerPortalPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EmployerFormData>({
    companyName: '',
    website: '',
    industry: '',
    location: '',
    employerType: '',
    jobTitle: '',
    jobType: '',
    jobDescription: '',
    techStack: [],
    blockchain: '',
    paymentAmount: 0,
    projectDeadline: '',
    githubIssueLink: '',
    verificationMethod: '',
    isWalletVerified: false,
    isCompanyVerified: false,
    isEscrowSetup: false,
    pyusdApproved: false,
    escrowFunded: false
  })

  // Auto-advance from step 1 when wallet is connected
  useEffect(() => {
    if (isConnected && address && currentStep === 1) {
      setFormData(prev => ({ ...prev, isWalletVerified: true }))
      setTimeout(() => {
        setCurrentStep(2)
      }, 1500)
    }
  }, [isConnected, address, currentStep])

  const handleNext = () => {
    if (currentStep < EMPLOYER_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Redirect to employer dashboard
    router.push('/employer/dashboard')
  }

  const updateFormData = (updates: Partial<EmployerFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConnectWalletStep
            isConnected={isConnected}
            address={address}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <CompanyProfileStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <CompanyVerificationStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <CreateJobStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <ApprovePYUSDStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 6:
        return (
          <FundEscrowStep
            formData={formData}
            onUpdate={updateFormData}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EmployerProgressIndicator
            steps={EMPLOYER_STEPS}
            currentStep={currentStep}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentStep()}
      </div>
    </div>
  )
}
