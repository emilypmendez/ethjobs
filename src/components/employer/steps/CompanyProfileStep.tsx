'use client'

import { useState } from 'react'
import { Building, Globe, MapPin, Users } from 'lucide-react'
import { EmployerFormData } from '@/app/employer/page'

interface CompanyProfileStepProps {
  formData: EmployerFormData
  onUpdate: (updates: Partial<EmployerFormData>) => void
  onNext: () => void
  onBack: () => void
}

const INDUSTRIES = [
  'DeFi',
  'NFT/Gaming',
  'Infrastructure',
  'DAO/Governance',
  'Developer Tools',
  'Fintech',
  'Enterprise',
  'Education',
  'Social',
  'Other'
]

const EMPLOYER_TYPES = [
  { value: 'startup', label: 'Startup' },
  { value: 'dao', label: 'DAO' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'individual', label: 'Individual' }
]

export default function CompanyProfileStep({ 
  formData, 
  onUpdate, 
  onNext, 
  onBack 
}: CompanyProfileStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof EmployerFormData, value: string) => {
    onUpdate({ [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required'
    }

    if (!formData.employerType) {
      newErrors.employerType = 'Employer type is required'
    }

    // Validate website format if provided
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must start with http:// or https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Company Profile
          </h1>
          <p className="text-gray-600">
            Tell us about your company to help developers understand who they'll be working with.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.companyName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your company name"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.website ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://www.example.com"
              />
            </div>
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.industry ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select an industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Remote, New York, Global, etc."
              />
            </div>
          </div>

          {/* Employer Type */}
          <div>
            <label htmlFor="employerType" className="block text-sm font-medium text-gray-700 mb-2">
              Employer Type *
            </label>
            <select
              id="employerType"
              value={formData.employerType}
              onChange={(e) => handleInputChange('employerType', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.employerType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select employer type</option>
              {EMPLOYER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.employerType && (
              <p className="mt-1 text-sm text-red-600">{errors.employerType}</p>
            )}
          </div>

          {/* Required Fields Note */}
          <div className="text-sm text-gray-500">
            Asterisk (*) indicates a required field.
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
