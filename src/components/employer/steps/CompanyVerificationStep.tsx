'use client'

import { useState } from 'react'
import { Shield, CheckCircle, Globe, FileText, AlertCircle } from 'lucide-react'
import { EmployerFormData } from '@/app/employer/page'

interface CompanyVerificationStepProps {
  formData: EmployerFormData
  onUpdate: (updates: Partial<EmployerFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function CompanyVerificationStep({ 
  formData, 
  onUpdate, 
  onNext, 
  onBack 
}: CompanyVerificationStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    onUpdate({ verificationMethod: method })
  }

  const handleNext = () => {
    // For demo purposes, mark verification as complete
    onUpdate({ 
      isCompanyVerified: true,
      isEscrowSetup: true 
    })
    onNext()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Company Verification
          </h1>
          <p className="text-gray-600">
            We need to verify your company to ensure the security and reliability of our platform. 
            This helps maintain trust between employers and developers.
          </p>
        </div>

        {/* Verification Progress */}
        <div className="space-y-4 mb-8">
          {/* Step 1 - Wallet Verified */}
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                1. Wallet address verified
              </h3>
              <p className="text-sm text-green-600">
                Your wallet connection has been verified successfully
              </p>
            </div>
          </div>

          {/* Step 2 - Company Profile */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                2. Company profile verification
              </h3>
              <p className="text-sm text-blue-600">
                We'll verify your company information to ensure it's legitimate.
              </p>
            </div>
          </div>

          {/* Step 3 - Escrow Setup */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-700">
                3. Escrow capability setup
              </h3>
              <p className="text-sm text-gray-600">
                We'll set up your account to handle escrow payments for hiring developers.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Options
          </h3>
          
          <div className="space-y-4">
            {/* Website Verification */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedMethod === 'website' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMethodSelect('website')}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Globe className="h-6 w-6 text-blue-600 mt-1" />
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    Website Verification
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Verify through DNS or website ownership
                  </p>
                </div>
              </div>
            </div>

            {/* Business Verification */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedMethod === 'business' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMethodSelect('business')}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600 mt-1" />
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    Business Verification
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Verify through business registration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Demo Mode
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                For this demo, verification will be automatically approved. 
                In production, this would involve actual verification processes.
              </p>
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
            disabled={!selectedMethod}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Continue Verification
          </button>
        </div>
      </div>
    </div>
  )
}
