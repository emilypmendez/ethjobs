'use client'

import Header from '@/components/ui/Header'
import Link from 'next/link'
import { 
  Shield, 
  Wallet, 
  Lock, 
  Github, 
  Award, 
  ArrowRight,
  CheckCircle,
  Coins,
  Users
} from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            How <span className="text-blue-600">ETHJobs</span> Works
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover how blockchain technology creates a transparent, secure, and efficient way 
            for companies to hire crypto developers.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Card 1: Blockchain-Powered Hiring */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Blockchain-Powered Hiring</h2>
            </div>
            
            <p className="text-lg text-gray-600 mb-6">
              ETHJobs uses blockchain technology to create a transparent, secure, and efficient way 
              for companies to hire crypto developers. Here's how our platform works in simple terms.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
              <p className="text-blue-800 italic text-lg">
                "Blockchain technology allows us to verify work, secure payments, and build trust 
                between employers and developers without traditional intermediaries."
              </p>
            </div>
            
            <p className="text-gray-600">
              Our platform combines the best of blockchain technology with user-friendly design, 
              making it accessible to both technical and non-technical users.
            </p>
          </div>
        </div>

        {/* Card 2: Connecting Your Wallet */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Wallet className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Connecting Your Wallet</h2>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              Your crypto wallet is like a digital identity card and bank account combined. 
              Here's what you need to know:
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What is a Crypto Wallet?</h3>
                <p className="text-gray-600 mb-6">
                  A crypto wallet is a digital tool that allows you to store and manage your cryptocurrencies. 
                  It also serves as your identity on the blockchain, similar to how an email address works 
                  for traditional websites.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Connect Your Wallet?</h3>
                <p className="text-gray-600 mb-4">Connecting your wallet to ETHJobs allows you to:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Verify your identity securely without sharing personal information
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Receive payments directly without bank transfers or third parties
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Access your on-chain reputation and work history
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Sign in seamlessly across devices without passwords
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
                <p className="text-gray-600 mb-4">
                  If you're new to crypto wallets, we recommend MetaMask, which is free and easy to set up.
                </p>
                <p className="text-gray-600">
                  Just click "Connect Wallet" in the top right corner, and follow the prompts to create 
                  or connect your wallet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Staking & Payments */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Coins className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Staking & Payments</h2>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              ETHJobs uses cryptocurrency for secure, transparent payments between employers and developers.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <Lock className="h-8 w-8 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How Staking Works</h3>
                <p className="text-gray-600 text-sm">
                  When you apply for a job, you'll "stake" a small amount of cryptocurrency. 
                  This is like a security deposit that shows you're serious about the job. 
                  When you complete the work successfully, you get your stake back plus your payment.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Escrow Protection</h3>
                <p className="text-gray-600 text-sm">
                  When an employer posts a job, they fund an "escrow" account with the full payment amount. 
                  This money is locked in a smart contract until the work is completed and approved. 
                  This guarantees that developers will get paid for completed work.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <Coins className="h-8 w-8 text-green-600 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Supported Currencies</h3>
                <p className="text-gray-600 text-sm">
                  ETHJobs currently supports payments in PYUSD, ETH, USDC, and DAI. 
                  These are all widely-used cryptocurrencies that can be easily exchanged 
                  for traditional money if needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Verification & Security */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Verification & Security</h2>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              ETHJobs provides multiple layers of security and verification to protect both employers and developers.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Github className="h-6 w-6 text-gray-900 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">GitHub Integration</h3>
                </div>
                <p className="text-gray-600">
                  By connecting your GitHub account, employers can verify your coding experience and past projects. 
                  This creates trust without requiring traditional resumes or references.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">On-Chain Reputation</h3>
                </div>
                <p className="text-gray-600">
                  As you complete jobs on ETHJobs, you'll earn NFT badges that serve as verifiable proof of your work. 
                  These digital certificates are stored on the blockchain and can't be faked or altered, 
                  creating a trustworthy work history.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Lock className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Smart Contract Security</h3>
                </div>
                <p className="text-gray-600">
                  All payments and agreements on ETHJobs are secured by smart contracts. 
                  These self-executing programs automatically enforce agreement terms. 
                  When work is approved, the smart contract automatically releases payment to the developer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Getting Started */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Getting Started in 3 Simple Steps</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect Your Wallet</h3>
                <p className="text-gray-600">
                  Click "Connect Wallet" in the top right corner to link your cryptocurrency wallet.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Complete Your Profile</h3>
                <p className="text-gray-600">
                  Set up your developer or employer profile with your skills and preferences.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Start Hiring or Working</h3>
                <p className="text-gray-600">
                  Browse jobs, apply with a stake, or post jobs with escrow funding to begin.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Your Account</h3>
              <p className="text-gray-600 mb-6">
                Are you looking to hire developers or find work as a developer?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  I'm a Developer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/employer"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  I'm an Employer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
