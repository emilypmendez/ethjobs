'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import ConnectButton from '@/components/web3/ConnectButton'
import { ArrowLeft, Wallet, Shield, Zap, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Load skills from localStorage
  useEffect(() => {
    const savedSkills = localStorage.getItem('selectedSkills')
    if (savedSkills) {
      try {
        const skills = JSON.parse(savedSkills)
        setSelectedSkills(skills)
      } catch (error) {
        console.error('Error parsing saved skills:', error)
      }
    }
  }, [])

  // Redirect to profile creation after successful wallet connection
  useEffect(() => {
    if (isConnected && address) {
      // Small delay to show success state
      setTimeout(() => {
        router.push('/profile/create')
      }, 1500)
    }
  }, [isConnected, address, router])

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Decentralized',
      description: 'Your profile is secured by blockchain technology. No central authority controls your data.'
    },
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Get paid in PYUSD with milestone-based payments. No waiting for traditional bank transfers.'
    },
    {
      icon: Users,
      title: 'Web3 Community',
      description: 'Connect with leading Web3 companies and projects building the future of the internet.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Join the Future of Work
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Connect your Web3 wallet to access exclusive opportunities in the decentralized economy.
              </p>
              
              {/* Selected Skills Preview */}
              {selectedSkills.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Your Selected Skills ({selectedSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.slice(0, 8).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {selectedSkills.length > 8 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        +{selectedSkills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Wallet Connection */}
          <div className="lg:pl-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {!isConnected ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Connect Your Wallet
                    </h2>
                    <p className="text-gray-600">
                      Connect your Web3 wallet to get started. We support MetaMask and other popular wallets.
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Secure blockchain authentication
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      No passwords or personal data required
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Full control over your profile
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Wallet Connected!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Successfully connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                  <div className="flex items-center justify-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Redirecting to profile setup...
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have a Web3 wallet?{' '}
                <a 
                  href="https://metamask.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Get MetaMask
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">Trusted by developers at</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-lg font-semibold text-gray-400">Ethereum</div>
              <div className="text-lg font-semibold text-gray-400">Polygon</div>
              <div className="text-lg font-semibold text-gray-400">Arbitrum</div>
              <div className="text-lg font-semibold text-gray-400">Base</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
