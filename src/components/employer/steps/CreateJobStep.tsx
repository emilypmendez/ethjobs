'use client'

import { useState } from 'react'
import { FileText, Calendar, DollarSign, Github } from 'lucide-react'
import { EmployerFormData } from '@/app/employer/page'
import SkillCollection from '@/components/ui/SkillCollection'

interface CreateJobStepProps {
  formData: EmployerFormData
  onUpdate: (updates: Partial<EmployerFormData>) => void
  onNext: () => void
  onBack: () => void
}

const JOB_TYPES = [
  'Project-based',
  'Contract',
  'Part-Time',
  'Full-Time',
  'Bounty'
]

const BLOCKCHAINS = [
  'Ethereum',
  'Polygon',
  'Optimism',
  'Arbitrum',
  'Base',
  'Solana'
]

export default function CreateJobStep({ 
  formData, 
  onUpdate, 
  onNext, 
  onBack 
}: CreateJobStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof EmployerFormData, value: string | number | string[]) => {
    onUpdate({ [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSkillsChange = (skills: string[]) => {
    handleInputChange('techStack', skills)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required'
    }

    if (!formData.jobType) {
      newErrors.jobType = 'Job type is required'
    }

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required'
    }

    if (formData.techStack.length === 0) {
      newErrors.techStack = 'At least one technology is required'
    }

    if (!formData.blockchain) {
      newErrors.blockchain = 'Blockchain selection is required'
    }

    if (!formData.paymentAmount || formData.paymentAmount <= 0) {
      newErrors.paymentAmount = 'Payment amount must be greater than 0'
    }

    if (!formData.projectDeadline) {
      newErrors.projectDeadline = 'Project deadline is required'
    }

    // Validate GitHub URL format if provided
    if (formData.githubIssueLink && !formData.githubIssueLink.match(/^https:\/\/github\.com\/.+/)) {
      newErrors.githubIssueLink = 'Must be a valid GitHub URL'
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
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Job Post
          </h1>
          <p className="text-gray-600">
            Provide detailed information about the job to attract the right developers.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.jobTitle ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Solidity Developer for DeFi Protocol"
            />
            {errors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
            )}
          </div>

          {/* Job Type */}
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              id="jobType"
              value={formData.jobType}
              onChange={(e) => handleInputChange('jobType', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.jobType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select job type</option>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.jobType && (
              <p className="mt-1 text-sm text-red-600">{errors.jobType}</p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              rows={4}
              value={formData.jobDescription}
              onChange={(e) => handleInputChange('jobDescription', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.jobDescription ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the job requirements, responsibilities, and expectations..."
            />
            {errors.jobDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.jobDescription}</p>
            )}
          </div>

          {/* Technology Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technology Stack
            </label>
            <SkillCollection
              onSkillsChange={handleSkillsChange}
              placeholder="Select technologies (e.g., Solidity, React, Python...)"
            />
            {errors.techStack && (
              <p className="mt-1 text-sm text-red-600">{errors.techStack}</p>
            )}
          </div>

          {/* Blockchain */}
          <div>
            <label htmlFor="blockchain" className="block text-sm font-medium text-gray-700 mb-2">
              Select a blockchain
            </label>
            <select
              id="blockchain"
              value={formData.blockchain}
              onChange={(e) => handleInputChange('blockchain', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.blockchain ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select blockchain</option>
              {BLOCKCHAINS.map((blockchain) => (
                <option key={blockchain} value={blockchain}>
                  {blockchain}
                </option>
              ))}
            </select>
            {errors.blockchain && (
              <p className="mt-1 text-sm text-red-600">{errors.blockchain}</p>
            )}
          </div>

          {/* Payment Amount */}
          <div>
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount (PYUSD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 text-gray-700 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="paymentAmount"
                min="0"
                step="0.01"
                value={formData.paymentAmount || ''}
                onChange={(e) => handleInputChange('paymentAmount', parseFloat(e.target.value) || 0)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.paymentAmount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">PYUSD</span>
              </div>
            </div>
            {errors.paymentAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
            )}
          </div>

          {/* Project Deadline */}
          <div>
            <label htmlFor="projectDeadline" className="block text-sm font-medium text-gray-700 mb-2">
              Project Deadline
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="projectDeadline"
                value={formData.projectDeadline}
                onChange={(e) => handleInputChange('projectDeadline', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.projectDeadline ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.projectDeadline && (
              <p className="mt-1 text-sm text-red-600">{errors.projectDeadline}</p>
            )}
          </div>

          {/* GitHub Issue Link */}
          <div>
            <label htmlFor="githubIssueLink" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Issue Link (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="githubIssueLink"
                value={formData.githubIssueLink}
                onChange={(e) => handleInputChange('githubIssueLink', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.githubIssueLink ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://github.com/your-org/your-repo/issues/123"
              />
            </div>
            {errors.githubIssueLink && (
              <p className="mt-1 text-sm text-red-600">{errors.githubIssueLink}</p>
            )}
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
