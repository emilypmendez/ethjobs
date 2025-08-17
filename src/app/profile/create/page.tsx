'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import SkillCollection from '@/components/ui/SkillCollection'
import ProgressIndicator from '@/components/ui/ProgressIndicator'
import { StepNavigation } from '@/components/ui/FlowNavigation'
import { createProfile, getProfileByWallet } from '@/lib/profile'
import { ArrowLeft, Calendar, User, MapPin, Briefcase, Loader2, Code, Globe, DollarSign } from 'lucide-react'

interface ProfileFormData {
  fullName: string
  bio: string
  experienceLevel: string
  location: string
  remotePreference: boolean
  availableStartDate: string
  skills: string[]
  githubUsername: string
  portfolioUrl: string
  hourlyRate: string
  preferredBlockchains: string[]
  yearsInWeb3: string
}

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior Level (5+ years)' },
  { value: 'lead', label: 'Lead/Principal (8+ years)' }
]

const WEB3_EXPERIENCE = [
  { value: '0-1', label: 'New to Web3 (0-1 years)' },
  { value: '1-2', label: 'Some experience (1-2 years)' },
  { value: '2-5', label: 'Experienced (2-5 years)' },
  { value: '5+', label: 'Expert (5+ years)' }
]

const POPULAR_BLOCKCHAINS = [
  'Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base', 'Avalanche',
  'Solana', 'Cardano', 'Polkadot', 'Cosmos', 'Near', 'Fantom'
]

const PROFILE_STEPS = [
  { id: 'basic', title: 'Basic Info', description: 'Your professional details' },
  { id: 'web3', title: 'Web3 Profile', description: 'Your blockchain experience' },
  { id: 'skills', title: 'Skills & Availability', description: 'Technical skills and availability' }
]

export default function CreateProfilePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    bio: '',
    experienceLevel: '',
    location: '',
    remotePreference: true,
    availableStartDate: '',
    skills: [],
    githubUsername: '',
    portfolioUrl: '',
    hourlyRate: '',
    preferredBlockchains: [],
    yearsInWeb3: ''
  })

  // Redirect to signup if wallet not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/signup')
      return
    }
  }, [isConnected, router])

  // Load skills from localStorage and check for existing profile
  useEffect(() => {
    const savedSkills = localStorage.getItem('selectedSkills')
    if (savedSkills) {
      try {
        const skills = JSON.parse(savedSkills)
        setFormData(prev => ({ ...prev, skills }))
      } catch (error) {
        console.error('Error parsing saved skills:', error)
      }
    }

    // Check if user already has a profile
    if (isConnected && address) {
      checkExistingProfile()
    }
  }, [isConnected, address])

  const checkExistingProfile = async () => {
    if (!address) return

    try {
      const { profile, error } = await getProfileByWallet(address)
      if (error) {
        console.error('Error checking existing profile:', error)
        return
      }

      if (profile) {
        // User already has a profile, redirect to jobs page
        const skillsParam = encodeURIComponent(JSON.stringify(profile.skills))
        const dateParam = profile.available_start_date ? `&date=${profile.available_start_date}` : ''
        router.push(`/jobs?skills=${skillsParam}${dateParam}`)
      }
    } catch (error) {
      console.error('Error checking existing profile:', error)
    }
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSkillsChange = (skills: string[]) => {
    setFormData(prev => ({ ...prev, skills }))
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push('/')
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { profile, error } = await createProfile({
        walletAddress: address,
        fullName: formData.fullName,
        bio: formData.bio,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        location: formData.location,
        remotePreference: formData.remotePreference,
        availableStartDate: formData.availableStartDate,
      })

      if (error) {
        setError(error)
        return
      }

      // Clear saved skills from localStorage
      localStorage.removeItem('selectedSkills')

      // Navigate to jobs page with skills filter
      const skillsParam = encodeURIComponent(JSON.stringify(formData.skills))
      const dateParam = formData.availableStartDate ? `&date=${formData.availableStartDate}` : ''
      router.push(`/jobs?skills=${skillsParam}${dateParam}`)
    } catch (error) {
      console.error('Error creating profile:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() && formData.experienceLevel && formData.location.trim()
      case 2:
        return formData.yearsInWeb3 && formData.preferredBlockchains.length > 0
      case 3:
        return formData.skills.length > 0 && formData.availableStartDate
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Web3 Developer Profile
          </h1>
          <p className="text-gray-600">
            Now that your wallet is connected, let's build your professional profile to match you with the best Web3 opportunities
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            steps={PROFILE_STEPS}
            currentStepId={PROFILE_STEPS[currentStep - 1]?.id || 'wallet'}
            showDescriptions={true}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Basic Information
                </h2>
                <p className="text-gray-600 text-center">
                  Let's start with your basic professional details
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about your background and what you're passionate about..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Experience Level *
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select your experience level</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.remotePreference}
                      onChange={(e) => handleInputChange('remotePreference', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Open to remote work
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Web3 Profile */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Web3 Experience
                </h2>
                <p className="text-gray-600 text-center">
                  Tell us about your blockchain and Web3 background
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Web3/Blockchain *
                  </label>
                  <select
                    value={formData.yearsInWeb3}
                    onChange={(e) => handleInputChange('yearsInWeb3', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select your Web3 experience</option>
                    {WEB3_EXPERIENCE.map((exp) => (
                      <option key={exp.value} value={exp.value}>
                        {exp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Blockchains *
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select the blockchain networks you have experience with or prefer to work on
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {POPULAR_BLOCKCHAINS.map((blockchain) => (
                      <label key={blockchain} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferredBlockchains.includes(blockchain)}
                          onChange={(e) => {
                            const current = formData.preferredBlockchains
                            if (e.target.checked) {
                              handleInputChange('preferredBlockchains', [...current, blockchain])
                            } else {
                              handleInputChange('preferredBlockchains', current.filter(b => b !== blockchain))
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {blockchain}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <Code className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.githubUsername}
                      onChange={(e) => handleInputChange('githubUsername', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your-github-username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio/Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Hourly Rate (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps match you with projects in your budget range
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Availability */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Skills & Availability
                </h2>
                <p className="text-gray-600 text-center">
                  Add your technical skills and when you're available to start
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Skills *
                  </label>
                  <p className="text-gray-600 mb-4">
                    {formData.skills.length > 0
                      ? "Great! We've loaded your selected skills. You can modify them below:"
                      : "Add your technical skills to help us match you with relevant opportunities:"
                    }
                  </p>

                  <SkillCollection
                    onSkillsChange={handleSkillsChange}
                    placeholder="Add your skills (e.g., React, Solidity, Web3.js)"
                  />

                  {formData.skills.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">
                        Selected Skills ({formData.skills.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.availableStartDate}
                      onChange={(e) => handleInputChange('availableStartDate', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    When are you available to start new projects?
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <StepNavigation
            currentStep={currentStep}
            totalSteps={3}
            onBack={handleBack}
            onNext={currentStep < 3 ? handleNext : handleSubmit}
            onCancel={() => router.push('/')}
            isNextDisabled={!isStepValid()}
            isNextLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
