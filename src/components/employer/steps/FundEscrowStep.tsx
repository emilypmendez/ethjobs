'use client'

import { useState } from 'react'
import { Lock, AlertTriangle, CheckCircle, ExternalLink, Calendar, DollarSign, FileText } from 'lucide-react'
import { EmployerFormData } from '@/app/employer/page'

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
  const [isFunding, setIsFunding] = useState(false)
  const [fundingTxHash, setFundingTxHash] = useState<string>('')

  const handleFundEscrow = async () => {
    setIsFunding(true)
    
    try {
      // In a real implementation, this would interact with the escrow contract
      // For demo purposes, we'll simulate the funding process
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)
      setFundingTxHash(mockTxHash)
      
      // Update form data
      onUpdate({ escrowFunded: true })
      
      // Auto-complete after successful funding
      setTimeout(() => {
        onComplete()
      }, 2000)
      
    } catch (error) {
      console.error('Funding failed:', error)
    } finally {
      setIsFunding(false)
    }
  }

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
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
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

        {/* Funding Status */}
        {!formData.escrowFunded ? (
          <div className="mb-6">
            <button
              onClick={handleFundEscrow}
              disabled={isFunding}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isFunding ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Funding Escrow & Posting Job...
                </div>
              ) : (
                'Fund Escrow & Post Job'
              )}
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Escrow Funded Successfully!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your job has been posted and the escrow has been funded. Redirecting to your dashboard...
                  </p>
                  {fundingTxHash && (
                    <div className="mt-2">
                      <a
                        href={`https://etherscan.io/tx/${fundingTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
                      >
                        View transaction
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
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
