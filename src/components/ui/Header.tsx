'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import ConnectButton from '@/components/web3/ConnectButton'

export default function Header() {
  const pathname = usePathname()
  const { isConnected } = useAccount()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/ethjobs-logo.svg"
                alt="ETHJobs"
                width={120}
                height={36}
                priority
              />
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/how-it-works"
              className={pathname === '/how-it-works'
                ? "text-blue-600 font-medium hover:text-blue-700"
                : "text-gray-600 hover:text-gray-900"
              }
            >
              How It Works
            </Link>
            <Link
              href="/jobs"
              className={pathname === '/jobs'
                ? "text-blue-600 font-medium hover:text-blue-700"
                : "text-gray-600 hover:text-gray-900"
              }
            >
              Search Jobs
            </Link>
            <Link
              href="/employer"
              className={pathname === '/employer'
                ? "text-blue-600 font-medium hover:text-blue-700"
                : "text-gray-600 hover:text-gray-900"
              }
            >
              Employer Login
            </Link>
            <div className="text-gray-400">|</div>
            <span className="text-gray-600 text-sm">Sepolia</span>
            <ConnectButton />
            {isConnected && (
              <Link
                href="/profile"
                className={pathname === '/profile'
                  ? "text-blue-600 font-medium hover:text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
                }
              >
                Profile
              </Link>
            )}
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
