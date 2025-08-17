'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/ethjobs-logo.svg"
                alt="ETHJobs"
                width={120}
                height={36}
                priority
              />
            </Link>
            <p className="text-gray-600 text-sm max-w-md">
              ETHJobs connects talented developers with innovative Web3 companies. 
              Find your next opportunity in the decentralized future.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Powered by PYUSD • Milestone-based payments • Charity integration
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/how-it-works"
                  className={pathname === '/how-it-works'
                    ? "text-blue-600 font-medium hover:text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                  }
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className={pathname === '/jobs'
                    ? "text-blue-600 font-medium hover:text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Search Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/employer"
                  className={pathname === '/employer'
                    ? "text-blue-600 font-medium hover:text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Employer Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className={pathname === '/signup'
                    ? "text-blue-600 font-medium hover:text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin & Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/admin"
                  className={pathname === '/admin'
                    ? "text-blue-600 font-medium hover:text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                  }
                >
                  Demo Admin
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@ethjobs.cc"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/emilypmendez/ethjobs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 ETHJobs.cc. Built for the Ethereum ecosystem.
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4 text-sm text-gray-500">
              <span>Network: Sepolia</span>
              <span>•</span>
              <span>Version: Beta</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
