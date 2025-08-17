// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { Lock, Info, Check, ExternalLink, Calendar, DollarSign, FileText } from 'lucide-react'
import { EmployerFormData } from '@/app/employer/page'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { type BaseError } from 'wagmi'

// Contract ABI
const ESCROW_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_employee', type: 'address' },
      { internalType: 'uint256', name: '_deadline', type: 'uint256' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'string', name: '_githubIssue', type: 'string' }
    ],
    name: 'createJob',
    outputs: [{ internalType: 'uint256', name: 'jobId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_jobId', type: 'uint256' }],
    name: 'fundJob',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'nextJobId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// Contract address (you'll need to update this with your deployed contract)
const ESCROW_CONTRACT_ADDRESS = '0x84c823a0E11ad6c0Da9021e8311e4A031E4256F4'

interface FundEscrowStepProps {
  formData: EmployerFormData
  onUpdate: (updates: Partial<EmployerFormData>) => void
  onComplete: () => void
  onBack: () => void
}

export default function FundEscrowStep({ 
  formData, 
  onUpdate, 
  onComplete, 
  onBack 
}: FundEscrowStepProps) {
  const [jobId, setJobId] = useState<number | null>(null)
  const [step, setStep] = useState<'create' | 'fund' | 'complete'>('create')
  
  // Wagmi hooks for contract interaction
  const { 
    data: createJobHash, 
    error: createJobError, 
    isPending: isCreatingJob, 
    writeContract: writeCreateJob 
  } = useWriteContract()

  const { 
    data: fundJobHash, 
    error: fundJobError, 
    isPending: isFundingJob, 
    writeContract: writeFundJob 
  } = useWriteContract()

  // Wait for createJob transaction
  const { 
    isLoading: isCreatingJobConfirming, 
    isSuccess: isCreateJobConfirmed 
  } = useWaitForTransactionReceipt({ hash: createJobHash })

  // Wait for fundJob transaction
  const { 
    isLoading: isFundingJobConfirming, 
    isSuccess: isFundJobConfirmed 
  } = useWaitForTransactionReceipt({ hash: fundJobHash })

  // Read nextJobId to get the current job ID
  const { data: nextJobId } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'nextJobId',
  })

  // Handle job creation
  const handleCreateJob = () => {
    const employeeAddress = '0x1a343eFB966E63bfA25A2b368455448f02466Ffc'
    const deadline = 1788192000000
    const amount = BigInt(Math.floor(formData.paymentAmount * 1.02 * 10**6)) // Convert to wei with 2% fee (PYUSD uses 6 decimals)
    const githubIssue = 'https://github.com/emilypmendez/ethjobs/issues/6'

    writeCreateJob({
      address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
      abi: ESCROW_ABI,
      functionName: 'createJob',
      args: [employeeAddress as `0x${string}`, BigInt(deadline), amount, githubIssue],
    })
  }

  // Handle job funding
  const handleFundJob = () => {
    if (nextJobId && nextJobId > 0) {
      const currentJobId = Number(nextJobId) - 1
      setJobId(currentJobId)
      console.log('currentJobId', currentJobId)
      writeFundJob({
        address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'fundJob',
        args: [BigInt(currentJobId)],
      })
    }
  }

  // Update step when createJob is confirmed
  React.useEffect(() => {
    if (isCreateJobConfirmed) {
      setStep('fund')
    }
  }, [isCreateJobConfirmed])

  // Update step when fundJob is confirmed
  React.useEffect(() => {
    if (isFundJobConfirmed) {
      setStep('complete')
      onUpdate({ escrowFunded: true })
      // Redirect to employer dashboard after successful funding
      setTimeout(() => {
        window.location.href = '/employer/dashboard'
      }, 2000)
    }
  }, [isFundJobConfirmed, onUpdate])

  const totalAmount = formData.paymentAmount
  const platformFee = totalAmount * 0.02 // 2% platform fee
  const totalWithFee = totalAmount + platformFee

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fund Escrow
          </h1>
          <p className="text-gray-600">
            Review your job details and fund the escrow contract to post your job.
          </p>
        </div>

        {/* Job Summary Card */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Job Summary
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <div className="font-medium text-gray-900">{formData.jobTitle}</div>
                <div className="text-sm text-gray-600">{formData.jobType}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <div className="font-medium text-gray-900">${formData.paymentAmount.toFixed(2)} PYUSD</div>
                <div className="text-sm text-gray-600">Payment Amount</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <div className="font-medium text-gray-900">
                  {new Date(formData.projectDeadline).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Project Deadline</div>
              </div>
            </div>

            {formData.techStack.length > 0 && (
              <div className="pt-2">
                <div className="text-sm text-gray-600 mb-2">Technologies:</div>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.slice(0, 5).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {formData.techStack.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{formData.techStack.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Escrow Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Fund Escrow Contract
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                To ensure trust and security for developers, we require all job payments to be funded in an escrow contract before the job is posted. The funds will only be released when the work is verified and approved.
              </p>
            </div>
          </div>
        </div>

        {/* Escrow Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Escrow Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount to Fund:</span>
              <span className="font-medium text-gray-700">${formData.paymentAmount.toFixed(2)} PYUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee (2%):</span>
              <span className="font-medium text-gray-700">${platformFee.toFixed(2)} PYUSD</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-semibold text-gray-900">${totalWithFee.toFixed(2)} PYUSD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(createJobError || fundJobError) && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Transaction Failed
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {createJobError ? (createJobError as BaseError).shortMessage || createJobError.message : ''}
                    {fundJobError ? (fundJobError as BaseError).shortMessage || fundJobError.message : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Create Job */}
        {step === 'create' && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Step 1: Create Job
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    First, create the job in the smart contract. This will generate a job ID that you'll need for funding.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateJob}
              disabled={isCreatingJob || isCreatingJobConfirming}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isCreatingJob ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Job...
                </div>
              ) : isCreatingJobConfirming ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Job Creation...
                </div>
              ) : (
                'Create Job'
              )}
            </button>

            {createJobHash && (
              <div className="mt-2 text-center">
                <a
                  href={`https://sepolia.etherscan.io/tx/${createJobHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  View job creation transaction
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Fund Job */}
        {step === 'fund' && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Step 2: Fund Job
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Job created successfully! Now fund the escrow with PYUSD tokens to complete the process.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleFundJob}
              disabled={isFundingJob || isFundingJobConfirming}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isFundingJob ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Funding Job...
                </div>
              ) : isFundingJobConfirming ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Funding...
                </div>
              ) : (
                'Fund Job'
              )}
            </button>

            {fundJobHash && (
              <div className="mt-2 text-center">
                <a
                  href={`https://sepolia.etherscan.io/tx/${fundJobHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
                >
                  View funding transaction
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Job Posted & Escrow Funded Successfully!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your job has been posted and the escrow has been funded. Redirecting to employer dashboard...
                  </p>
                  {jobId !== null && (
                    <div className="mt-2 text-sm text-green-600">
                      Job ID: {jobId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {!formData.escrowFunded && (
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <div className="text-sm text-gray-500 flex items-center">
              Ready to fund escrow
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
