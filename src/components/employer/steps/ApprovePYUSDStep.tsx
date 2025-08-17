'use client'

import { useState } from 'react'
import { DollarSign, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { EmployerFormData } from '@/app/employer/page'
import { useAccount } from 'wagmi'

interface ApprovePYUSDStepProps {
  formData: EmployerFormData
  onUpdate: (updates: Partial<EmployerFormData>) => void
  onNext: () => void
  onBack: () => void
}

// PYUSD contract address on Ethereum mainnet
const PYUSD_CONTRACT_ADDRESS = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'
// Demo escrow contract address (would be the actual deployed contract)
const ESCROW_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'

export default function ApprovePYUSDStep({ 
  formData, 
  onUpdate, 
  onNext, 
  onBack 
}: ApprovePYUSDStepProps) {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  const [approvalTxHash, setApprovalTxHash] = useState<string>('')

  const handleApprove = async () => {
    setIsApproving(true)
    
    try {
      // In a real implementation, this would interact with the PYUSD contract
      // For demo purposes, we'll simulate the approval process
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)
      setApprovalTxHash(mockTxHash)
      
      // Update form data
      onUpdate({ pyusdApproved: true })
      
    } catch (error) {
      console.error('Approval failed:', error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleNext = () => {
    if (formData.pyusdApproved) {
      onNext()
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
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Approve PYUSD Tokens
          </h1>
          <p className="text-gray-600">
            Before funding the escrow, you need to approve the smart contract to use your PYUSD tokens. 
            This is a standard security measure for ERC-20 tokens.
          </p>
        </div>

        {/* Token Approval Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Token Approval Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Token:</span>
              <span className="font-medium text-gray-700">PYUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount to Approve:</span>
              <span className="font-medium text-gray-700">${totalWithFee.toFixed(2)} PYUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contract Address:</span>
              <span className="font-mono text-sm text-gray-800">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Status */}
        {!formData.pyusdApproved ? (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Approval Required
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This approval transaction will appear in your wallet. Once approved, you'll be able to fund the escrow in the next step.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isApproving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Approving...
                </div>
              ) : (
                `Approve $${totalWithFee.toFixed(2)} PYUSD`
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
                    PYUSD Tokens Approved Successfully
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your PYUSD tokens have been approved for the escrow contract. You can now proceed to fund the escrow.
                  </p>
                  {approvalTxHash && (
                    <div className="mt-2">
                      <a
                        href={`https://etherscan.io/tx/${approvalTxHash}`}
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

        {/* Contract Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Smart Contract Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">PYUSD Contract:</span>
              <span className="font-mono text-blue-800 text-xs">
                {PYUSD_CONTRACT_ADDRESS.slice(0, 10)}...{PYUSD_CONTRACT_ADDRESS.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Escrow Contract:</span>
              <span className="font-mono text-blue-800 text-xs">
                {ESCROW_CONTRACT_ADDRESS.slice(0, 10)}...{ESCROW_CONTRACT_ADDRESS.slice(-8)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!formData.pyusdApproved}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Escrow
          </button>
        </div>
      </div>
    </div>
  )
}
