'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { calculateProfileScore, getProfileCompletionSuggestions } from '@/lib/profileActivity'
import { Profile } from '@/lib/database.types'

interface ProfileTestHelperProps {
  profile: Profile | null
}

export default function ProfileTestHelper({ profile }: ProfileTestHelperProps) {
  const { isConnected, address } = useAccount()
  const [showDetails, setShowDetails] = useState(false)

  if (!profile) return null

  const profileScore = calculateProfileScore(profile)
  const suggestions = getProfileCompletionSuggestions(profile)

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-yellow-800">
            Profile Test Helper (Development Only)
          </span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-yellow-600 hover:text-yellow-800 text-sm"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Wallet Connected:</span>
              <span className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Profile Score:</span>
              <span className="ml-2 text-blue-600">{profileScore}%</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Wallet Address:</span>
              <span className="ml-2 text-gray-600 font-mono text-xs">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Skills Count:</span>
              <span className="ml-2 text-gray-600">{profile.skills?.length || 0}</span>
            </div>
          </div>
          
          {suggestions.length > 0 && (
            <div>
              <span className="font-medium text-gray-700 block mb-2">Profile Completion Suggestions:</span>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="pt-2 border-t border-yellow-200">
            <span className="font-medium text-gray-700 block mb-2">Profile Data:</span>
            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify({
                id: profile.id,
                full_name: profile.full_name,
                experience_level: profile.experience_level,
                location: profile.location,
                skills_count: profile.skills?.length || 0,
                remote_preference: profile.remote_preference,
                available_start_date: profile.available_start_date
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
