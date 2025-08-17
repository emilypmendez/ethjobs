'use client'

import { Wallet, CheckCircle, Shield, Zap, Users } from 'lucide-react'
import ConnectButton from '@/components/web3/ConnectButton'

interface ConnectWalletStepProps {
  isConnected: boolean
  address?: string
  onNext: () => void
}

export default function ConnectWalletStep({ 
  isConnected, 
  address, 
  onNext 
}: ConnectWalletStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {!isConnected ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Connect Your Crypto Wallet
              </h1>
              <p className="text-lg text-gray-600">
                To post jobs and fund escrow contracts, you'll need to connect a cryptocurrency wallet. 
                This allows you to securely pay developers and interact with smart contracts.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Secure Payments</h3>
                  <p className="text-sm text-gray-600">
                    All payments are secured by smart contracts and blockchain technology
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Zap className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Instant Transactions</h3>
                  <p className="text-sm text-gray-600">
                    Fast, borderless payments with PYUSD stablecoin
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Trust & Transparency</h3>
                  <p className="text-sm text-gray-600">
                    Escrow contracts ensure developers get paid for completed work
                  </p>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <div className="text-center">
              <ConnectButton />
              <p className="text-xs text-gray-500 mt-3">
                We support MetaMask, WalletConnect, and other popular Web3 wallets
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Wallet Connected Successfully!
              </h1>
              <p className="text-lg text-green-600 font-medium mb-6">
                ✓ Wallet connected successfully!
              </p>
              
              {/* Wallet Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Connected Wallet</div>
                <div className="font-mono text-sm text-gray-900">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>

              <p className="text-gray-600 mb-8">
                Great! Your wallet is now connected. Let's set up your company profile to get started with posting jobs.
              </p>

              <button
                onClick={onNext}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue to Company Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
