'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import ConnectButton from '@/components/web3/ConnectButton'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/ethjobs-logo.png"
                alt="ETHJobs"
                width={120}
                height={36}
                priority
              />
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Web3 jobs..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div> */}

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="text-blue-600 font-medium hover:text-blue-700">
              Jobs
            </Link>
            <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
              Leaderboard
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            <Link href="/employer" className="text-gray-600 hover:text-gray-900">
              Employer
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
            <div className="text-gray-400">|</div>
            <span className="text-gray-600 text-sm">Sepolia</span>
            <ConnectButton />
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
}
