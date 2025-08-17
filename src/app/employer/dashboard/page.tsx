// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { type BaseError } from 'wagmi'
import Header from '@/components/ui/Header'
import { 
  Search, 
  Filter, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  Wallet,
  DollarSign,
  Users
} from 'lucide-react'

// Contract ABI for releaseFunds function and nextJobId
const ESCROW_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_jobId', type: 'uint256' }],
    name: 'releaseFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'nextJobId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// Contract address (same as in FundEscrowStep)
const ESCROW_CONTRACT_ADDRESS = '0x84c823a0E11ad6c0Da9021e8311e4A031E4256F4'

interface Transaction {
  id: string
  type: 'stake' | 'payment' | 'refund'
  title: string
  description: string
  amount: string
  currency: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  txHash?: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'stake',
    title: 'Job Application Stake',
    description: 'Smart Contract Auditor',
    amount: '-$500',
    currency: 'PYUSD',
    date: '2025-03-15',
    status: 'completed',
    txHash: '0x1234567890abcdef'
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    description: 'NFT Marketplace Frontend',
    amount: '+$4500',
    currency: 'ETH',
    date: '2025-03-10',
    status: 'completed',
    txHash: '0xabcdef1234567890'
  },
  {
    id: '3',
    type: 'refund',
    title: 'Stake Refund',
    description: 'DeFi Protocol Integration',
    amount: '+$300',
    currency: 'USDC',
    date: '2025-03-05',
    status: 'completed',
    txHash: '0x567890abcdef1234'
  },
  {
    id: '4',
    type: 'stake',
    title: 'Job Application Stake',
    description: 'DAO Governance System',
    amount: '-$450',
    currency: 'PYUSD',
    date: '2025-02-28',
    status: 'completed',
    txHash: '0xdef1234567890abc'
  },
  {
    id: '5',
    type: 'payment',
    title: 'Payment Received',
    description: 'Layer 2 Optimization',
    amount: '+$5800',
    currency: 'ETH',
    date: '2025-02-20',
    status: 'completed',
    txHash: '0x234567890abcdef1'
  },
  {
    id: '6',
    type: 'stake',
    title: 'Job Application Stake',
    description: 'Cross-Chain Bridge Development',
    amount: '-$600',
    currency: 'PYUSD',
    date: '2025-02-15',
    status: 'pending'
  }
]

export default function EmployerDashboardPage() {
  const { address, isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isReleasingFunds, setIsReleasingFunds] = useState(false)

  // Read nextJobId to get the current job ID
  const { data: nextJobId } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'nextJobId',
  })

  // Wagmi hooks for contract interaction
  const { 
    data: releaseFundsHash, 
    error: releaseFundsError, 
    isPending: isReleasingFundsPending, 
    writeContract: writeReleaseFunds 
  } = useWriteContract()

  // Wait for releaseFunds transaction
  const { 
    isLoading: isReleasingFundsConfirming, 
    isSuccess: isReleaseFundsConfirmed 
  } = useWaitForTransactionReceipt({ hash: releaseFundsHash })

  // Handle releasing funds
  const handleReleaseFunds = () => {
    if (!nextJobId || nextJobId <= 0) return
    
    // Calculate current job ID (nextJobId - 1)
    const currentJobId = Number(nextJobId) - 1
    console.log('Releasing funds for job ID:', currentJobId)
    
    setIsReleasingFunds(true)
    
    writeReleaseFunds({
      address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
      abi: ESCROW_ABI,
      functionName: 'releaseFunds',
      args: [BigInt(currentJobId)],
    })
  }

  // Update state when releaseFunds is confirmed
  useEffect(() => {
    if (isReleaseFundsConfirmed) {
      setIsReleasingFunds(false)
      // You could add a success message or update the UI here
    }
  }, [isReleaseFundsConfirmed])

  const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || tx.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'stake':
        return <ArrowUpRight className="h-4 w-4 text-yellow-600" />
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'refund':
        return <TrendingDown className="h-4 w-4 text-blue-600" />
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Failed</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Please connect your wallet to access the dashboard
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wallet Transactions
          </h1>
          <p className="text-gray-600">
            Track your job applications, payments, and staking activity
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">$9,450</p>
              </div>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">$10,300</p>
              </div>
            </div>
          </div>

          {/* Total Staked */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staked</p>
                <p className="text-2xl font-bold text-gray-900">$950</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ready to Pay Transaction */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Job Payment Ready</h3>
                    <p className="text-sm text-gray-600">Smart Contract Auditor - Ready to release funds</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Ready to Pay</span>
                      <a
                        href="https://github.com/emilypmendez/ethjobs/issues/6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        View GitHub Issue
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">$500 PYUSD</div>
                <div className="text-sm text-gray-500">
                  Job ID: #{nextJobId ? Number(nextJobId) - 1 : '...'}
                </div>
                <button
                  onClick={handleReleaseFunds}
                  disabled={isReleasingFundsPending || isReleasingFundsConfirming}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isReleasingFundsPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Confirming...
                    </div>
                  ) : isReleasingFundsConfirming ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Release Funds'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {releaseFundsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Release Funds Failed
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {(releaseFundsError as BaseError).shortMessage || releaseFundsError.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isReleaseFundsConfirmed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Funds Released Successfully!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  The payment has been released to the developer. Transaction completed.
                </p>
                {releaseFundsHash && (
                  <div className="mt-2">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${releaseFundsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
                    >
                      View transaction
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search transactions"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Filter Transactions</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.title}
                          </div>
                          <div className="text-sm text-blue-600">
                            {transaction.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.amount} {transaction.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {transaction.txHash ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${transaction.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          View
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Your transaction history will appear here once you start using the platform.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
