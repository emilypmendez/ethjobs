'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import SkillCollection from './SkillCollection'

export default function NewLandingHero() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills)
  }

  const handleGetStarted = () => {
    // For now, just navigate to jobs page
    // In the future, this could store skills in user profile or local storage
    if (selectedSkills.length > 0) {
      console.log('User skills:', selectedSkills)
      // Could store in localStorage or send to backend
      localStorage.setItem('userSkills', JSON.stringify(selectedSkills))
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 min-h-[80vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
            <span className="text-blue-600">Get Paid.</span>{' '}
            <span className="text-purple-600">Now.</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            What can you do?
          </p>
        </div>

        {/* Skill Collection Section */}
        <div className="mb-12">
          <SkillCollection 
            onSkillsChange={handleSkillsChange}
            placeholder="What skills do you have? (e.g., Solidity, React, Python...)"
            className="mb-8"
          />
          
          {/* Skills Preview */}
          {selectedSkills.length > 0 && (
            <div className="mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-gray-700 font-medium">
                  Great! You have {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                We&apos;ll help you find opportunities that match your expertise in the Web3 ecosystem.
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <Link 
            href="/signup"
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Find Web3 Jobs
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          
          <div className="text-sm text-gray-500">
            Join the future of work in Web3
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">PYUSD</div>
            <div className="text-gray-600 font-medium mb-2">Stable Payments</div>
            <div className="text-sm text-gray-500">Get paid in stable cryptocurrency</div>
          </div>
          
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">Milestone</div>
            <div className="text-gray-600 font-medium mb-2">Based Payments</div>
            <div className="text-sm text-gray-500">Secure payments tied to deliverables</div>
          </div>
          
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">Impact</div>
            <div className="text-gray-600 font-medium mb-2">Charity Integration</div>
            <div className="text-sm text-gray-500">Make a difference while you work</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            ETHJobs connects talented developers with innovative Web3 companies. 
            Whether you&apos;re a Solidity expert, frontend developer, or blockchain enthusiast,
            find your next opportunity in the decentralized future.
          </p>
        </div>
      </div>
    </div>
  )
}
