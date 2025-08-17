'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  DollarSign, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  TrendingUp,
  TrendingDown,
  X,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'

interface Transaction {
  id: string
  wallet_address: string
  transaction_type: string
  amount: number
  currency: string
  tx_hash?: string
  block_number?: number
  status: string
  job_id?: string
  description?: string
  metadata?: any
  created_at: string
  updated_at: string
}

interface PaymentStats {
  totalVolume: number
  totalTransactions: number
  completedTransactions: number
  pendingTransactions: number
  failedTransactions: number
  averageAmount: number
  recentVolume: number
}

interface PaymentMonitoringProps {
  onClose: () => void
}

export default function PaymentMonitoring({ onClose }: PaymentMonitoringProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // Check if transactions table exists
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (searchQuery.trim()) {
        query = query.or(`wallet_address.ilike.%${searchQuery}%,tx_hash.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      if (filterType) {
        query = query.eq('transaction_type', filterType)
      }

      if (filterStatus) {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          console.log('Transactions table does not exist yet')
          setTransactions([])
        } else {
          console.log('Error fetching transactions:', error)
        }
      } else {
        setTransactions(data || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, status, created_at')

      if (error) {
        if (error.code !== '42P01') {
          console.error('Error fetching transaction stats:', error)
        }
        setStats({
          totalVolume: 0,
          totalTransactions: 0,
          completedTransactions: 0,
          pendingTransactions: 0,
          failedTransactions: 0,
          averageAmount: 0,
          recentVolume: 0
        })
        return
      }

      const transactions = data || []
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const completedTxs = transactions.filter(t => t.status === 'completed')
      const totalVolume = completedTxs.reduce((sum, t) => sum + (t.amount || 0), 0)
      const recentVolume = completedTxs
        .filter(t => new Date(t.created_at) >= sevenDaysAgo)
        .reduce((sum, t) => sum + (t.amount || 0), 0)

      setStats({
        totalVolume,
        totalTransactions: transactions.length,
        completedTransactions: completedTxs.length,
        pendingTransactions: transactions.filter(t => t.status === 'pending').length,
        failedTransactions: transactions.filter(t => t.status === 'failed').length,
        averageAmount: completedTxs.length > 0 ? totalVolume / completedTxs.length : 0,
        recentVolume
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTransactions()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, filterType, filterStatus])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'PYUSD') => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
      case 'escrow_release':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'stake':
      case 'escrow_fund':
      case 'pyusd_approval':
        return <ArrowDownLeft className="h-4 w-4 text-blue-600" />
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-orange-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'payment':
      case 'escrow_release':
        return 'bg-green-100 text-green-800'
      case 'stake':
      case 'escrow_fund':
        return 'bg-blue-100 text-blue-800'
      case 'pyusd_approval':
        return 'bg-purple-100 text-purple-800'
      case 'refund':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Payment Monitoring</h2>
            <span className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              PYUSD Transactions
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Stats Overview */}
            {stats && (
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.totalVolume)}
                    </div>
                    <div className="text-sm text-gray-600">Total Volume</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.totalTransactions}
                    </div>
                    <div className="text-sm text-gray-600">Total Transactions</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.completedTransactions}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.pendingTransactions}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.failedTransactions}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(stats.averageAmount)}
                    </div>
                    <div className="text-sm text-gray-600">Average Amount</div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by wallet address, tx hash, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="payment">Payment</option>
                    <option value="stake">Stake</option>
                    <option value="refund">Refund</option>
                    <option value="escrow_fund">Escrow Fund</option>
                    <option value="escrow_release">Escrow Release</option>
                    <option value="pyusd_approval">PYUSD Approval</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-500">
                    {searchQuery || filterType || filterStatus 
                      ? 'Try adjusting your search or filters' 
                      : 'Transactions table may not exist yet or no transactions have been recorded'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(transaction.transaction_type)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(transaction.transaction_type)}`}>
                                {transaction.transaction_type.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                                {transaction.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {truncateAddress(transaction.wallet_address)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowDetails(true)
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {transaction.description && (
                        <div className="mt-2 text-sm text-gray-600">
                          {transaction.description}
                        </div>
                      )}

                      {transaction.tx_hash && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span className="font-mono">{truncateAddress(transaction.tx_hash)}</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details Sidebar */}
          {showDetails && selectedTransaction && (
            <div className="w-96 border-l bg-gray-50 flex flex-col">
              <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Transaction Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.transaction_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedTransaction.status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{selectedTransaction.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                      <p className="text-sm text-gray-900 font-mono break-all">{selectedTransaction.wallet_address}</p>
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                {selectedTransaction.tx_hash && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Blockchain Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Transaction Hash</label>
                        <p className="text-sm text-gray-900 font-mono break-all">{selectedTransaction.tx_hash}</p>
                      </div>
                      {selectedTransaction.block_number && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Block Number</label>
                          <p className="text-sm text-gray-900">{selectedTransaction.block_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedTransaction.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                    <p className="text-sm text-gray-700">{selectedTransaction.description}</p>
                  </div>
                )}

                {/* Metadata */}
                {selectedTransaction.metadata && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Metadata</h4>
                    <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(selectedTransaction.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Created: {formatDate(selectedTransaction.created_at)}</div>
                    <div>Last Updated: {formatDate(selectedTransaction.updated_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
