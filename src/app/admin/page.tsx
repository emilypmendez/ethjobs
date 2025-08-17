'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import {
  ArrowLeft,
  Settings,
  Users,
  Briefcase,
  DollarSign,
  BarChart3,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Building,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { getAdminStats, getRecentActivity, getSystemHealth, AdminStats, RecentActivity } from '@/lib/admin'
import { seedTestData, clearTestData } from '@/lib/admin-seed'
import { testDatabaseAccess, createMinimalTestData, getBasicStats } from '@/lib/admin-simple'
import { createBasicTestData, getBasicDashboardStats, getBasicRecentActivity, clearBasicTestData } from '@/lib/admin-basic'
import { fixRLSPolicies } from '@/lib/admin-rls-fix'
import UserManagement from '@/components/admin/UserManagement'
import JobManagement from '@/components/admin/JobManagement'
import PaymentMonitoring from '@/components/admin/PaymentMonitoring'
import Analytics from '@/components/admin/Analytics'
import CompanyManagement from '@/components/admin/CompanyManagement'

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [seeding, setSeeding] = useState(false)
  const [seedingMessage, setSeedingMessage] = useState<string | null>(null)

  // Modal states
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showJobManagement, setShowJobManagement] = useState(false)
  const [showPaymentMonitoring, setShowPaymentMonitoring] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showCompanyManagement, setShowCompanyManagement] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [statsResult, activitiesResult, healthResult] = await Promise.all([
        getAdminStats(),
        getRecentActivity(),
        getSystemHealth()
      ])

      if (statsResult.error) {
        setError(statsResult.error)
      } else {
        setStats(statsResult.stats)
      }

      if (activitiesResult.error) {
        console.error('Activities error:', activitiesResult.error)
      } else {
        setActivities(activitiesResult.activities)
      }

      if (healthResult.error) {
        console.error('Health check error:', healthResult.error)
      } else {
        setSystemHealth(healthResult.health)
      }

      setLastRefresh(new Date())
    } catch (err) {
      setError('Failed to fetch admin data')
      console.error('Admin data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSeedData = async () => {
    setSeeding(true)
    setSeedingMessage(null)

    try {
      const result = await seedTestData()
      if (result.success) {
        setSeedingMessage('Test data seeded successfully!')
        // Refresh the dashboard data
        await fetchData()
      } else {
        setSeedingMessage(`Error seeding data: ${result.error}`)
      }
    } catch (error) {
      setSeedingMessage('Failed to seed test data')
      console.error('Seeding error:', error)
    } finally {
      setSeeding(false)
      // Clear message after 5 seconds
      setTimeout(() => setSeedingMessage(null), 5000)
    }
  }

  const handleClearData = async () => {
    const confirmMessage = `Are you sure you want to clear ONLY the test data created by the seeding functions?

This will delete:
- Test profiles with specific wallet addresses (0x1234..., 0x2345..., 0x3456...)
- Test companies named "DeFi Protocol Inc" and "Web3 Solutions LLC"
- Test jobs titled "Senior Solidity Developer" and "Frontend Web3 Developer"
- Related test transactions

This will NOT delete any real user data or existing data you've created manually.

Continue?`

    if (!confirm(confirmMessage)) {
      return
    }

    setSeeding(true)
    setSeedingMessage(null)

    try {
      const result = await clearTestData()
      if (result.success) {
        setSeedingMessage('Test data cleared successfully! Only seeded test data was removed.')
        // Refresh the dashboard data
        await fetchData()
      } else {
        setSeedingMessage(`Error clearing data: ${result.error}`)
      }
    } catch (error) {
      setSeedingMessage('Failed to clear test data')
      console.error('Clearing error:', error)
    } finally {
      setSeeding(false)
      // Clear message after 5 seconds
      setTimeout(() => setSeedingMessage(null), 5000)
    }
  }

  const handleSimpleTest = async () => {
    setSeeding(true)
    setSeedingMessage(null)

    try {
      // First test database access
      const testResult = await testDatabaseAccess()
      console.log('Database test result:', testResult)

      if (testResult.success) {
        setSeedingMessage(`Database test successful! Found: ${testResult.data?.profiles} profiles, ${testResult.data?.companies} companies, ${testResult.data?.jobs} jobs, ${testResult.data?.transactions} transactions`)

        // If no data exists, try to create minimal test data
        if (testResult.data && Object.values(testResult.data).every(count => count === 0)) {
          console.log('No data found, creating minimal test data...')
          const createResult = await createMinimalTestData()
          if (createResult.success) {
            setSeedingMessage('Database test successful and minimal test data created!')
          } else {
            setSeedingMessage(`Database test successful but failed to create test data: ${createResult.error}`)
          }
        }

        // Refresh the dashboard
        await fetchData()
      } else {
        setSeedingMessage(`Database test failed: ${testResult.error}`)
      }
    } catch (error) {
      setSeedingMessage('Database test failed with error')
      console.error('Simple test error:', error)
    } finally {
      setSeeding(false)
      // Clear message after 10 seconds for longer messages
      setTimeout(() => setSeedingMessage(null), 10000)
    }
  }

  const handleBasicSeed = async () => {
    setSeeding(true)
    setSeedingMessage(null)

    try {
      const result = await createBasicTestData()
      if (result.success) {
        setSeedingMessage(`Basic test data created successfully! Created ${result.created?.profiles || 0} profiles.`)
        // Refresh the dashboard data
        await fetchData()
      } else {
        setSeedingMessage(`Error creating basic test data: ${result.error}`)
      }
    } catch (error) {
      setSeedingMessage('Failed to create basic test data')
      console.error('Basic seeding error:', error)
    } finally {
      setSeeding(false)
      // Clear message after 5 seconds
      setTimeout(() => setSeedingMessage(null), 5000)
    }
  }

  const handleClearBasicData = async () => {
    const confirmMessage = `Are you sure you want to clear the basic test data?

This will delete ONLY profiles with wallet addresses starting with "0xdemo".

Continue?`

    if (!confirm(confirmMessage)) {
      return
    }

    setSeeding(true)
    setSeedingMessage(null)

    try {
      const result = await clearBasicTestData()
      if (result.success) {
        setSeedingMessage('Basic test data cleared successfully!')
        // Refresh the dashboard data
        await fetchData()
      } else {
        setSeedingMessage(`Error clearing basic data: ${result.error}`)
      }
    } catch (error) {
      setSeedingMessage('Failed to clear basic test data')
      console.error('Basic clearing error:', error)
    } finally {
      setSeeding(false)
      // Clear message after 5 seconds
      setTimeout(() => setSeedingMessage(null), 5000)
    }
  }

  const handleFixRLS = async () => {
    const confirmMessage = `This will attempt to add missing RLS policies for companies and jobs tables:

- INSERT policy for companies
- INSERT, UPDATE, DELETE policies for jobs

This requires database admin privileges. Continue?`

    if (!confirm(confirmMessage)) {
      return
    }

    setSeeding(true)
    setSeedingMessage(null)

    try {
      const result = await fixRLSPolicies()
      if (result.success) {
        setSeedingMessage('RLS policies fixed successfully! You can now try seeding jobs data.')
      } else {
        setSeedingMessage(`Error fixing RLS policies: ${result.error}`)
      }
    } catch (error) {
      setSeedingMessage('Failed to fix RLS policies')
      console.error('RLS fix error:', error)
    } finally {
      setSeeding(false)
      // Clear message after 10 seconds for longer messages
      setTimeout(() => setSeedingMessage(null), 10000)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'job_posted':
        return <Briefcase className="h-4 w-4 text-purple-600" />
      case 'payment_made':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'company_verified':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }
  return (
    <div className="bg-gray-50">
      <Header />
      
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Monitor platform activity and manage system resources
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <button
              onClick={handleSimpleTest}
              disabled={loading || seeding}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Test Database
            </button>
            <button
              onClick={handleBasicSeed}
              disabled={loading || seeding}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Basic Seed
            </button>
            <button
              onClick={handleClearBasicData}
              disabled={loading || seeding}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
              title="Clear only basic test profiles (0xdemo...)"
            >
              Clear Basic
            </button>
            <button
              onClick={handleFixRLS}
              disabled={loading || seeding}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors"
              title="Fix missing RLS policies for companies and jobs tables"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Fix RLS
            </button>
            <button
              onClick={handleSeedData}
              disabled={loading || seeding}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Seed Test Data
            </button>
            <button
              onClick={handleClearData}
              disabled={loading || seeding}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              title="Clear only test data created by seeding functions"
            >
              Clear Test Data
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {seedingMessage && (
          <div className={`mb-8 p-4 border rounded-lg ${
            seedingMessage.includes('Error') || seedingMessage.includes('Failed')
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center">
              {seedingMessage.includes('Error') || seedingMessage.includes('Failed') ? (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              )}
              <span className={
                seedingMessage.includes('Error') || seedingMessage.includes('Failed')
                  ? 'text-red-800'
                  : 'text-green-800'
              }>
                {seedingMessage}
              </span>
            </div>
          </div>
        )}

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Users Management */}
          <div
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowUserManagement(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
              </div>
              {stats?.users.growthRate !== undefined && (
                <div className={`flex items-center text-sm ${stats.users.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.users.growthRate >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(stats.users.growthRate).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-gray-600 mb-4">Manage user accounts and profiles</p>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(stats?.users.total || 0)}
            </div>
            <div className="text-sm text-gray-500">
              Total Users • {stats?.users.recentCount || 0} this week
            </div>
          </div>

          {/* Jobs Management */}
          <div
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowJobManagement(true)}
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Jobs</h3>
            </div>
            <p className="text-gray-600 mb-4">Manage job postings and applications</p>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(stats?.jobs.active || 0)}
            </div>
            <div className="text-sm text-gray-500">
              Active Jobs • {stats?.jobs.total || 0} total • {stats?.jobs.completed || 0} completed
            </div>
          </div>

          {/* Payments */}
          <div
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowPaymentMonitoring(true)}
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
            </div>
            <p className="text-gray-600 mb-4">Monitor PYUSD transactions</p>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(stats?.payments.totalVolume || 0)}
            </div>
            <div className="text-sm text-gray-500">
              Total Volume • {stats?.payments.totalTransactions || 0} transactions
            </div>
          </div>

          {/* Analytics */}
          <div
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowAnalytics(true)}
          >
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">Platform usage statistics</p>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(stats?.analytics.activeUsers || 0)}
            </div>
            <div className="text-sm text-gray-500">
              Active Users • {stats?.analytics.conversionRate.toFixed(1) || 0}% conversion rate
            </div>
          </div>

          {/* Companies */}
          <div
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowCompanyManagement(true)}
          >
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <Building className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
            </div>
            <p className="text-gray-600 mb-4">Manage company verifications</p>
            <div className="text-2xl font-bold text-indigo-600 mb-2">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(stats?.companies.total || 0)}
            </div>
            <div className="text-sm text-gray-500">
              Total • {stats?.companies.verified || 0} verified • {stats?.companies.pending || 0} pending
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-lg mr-4">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">Platform configuration</p>
            <div className="text-sm text-gray-500">
              System Status: {systemHealth?.database === 'healthy' ? 'Active' : 'Issues Detected'}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeAgo(activity.timestamp)}
                        {activity.amount && (
                          <span className="ml-2 font-medium">
                            {formatCurrency(activity.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              System Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`text-center p-4 rounded-lg ${
                systemHealth?.database === 'healthy' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`font-semibold flex items-center justify-center ${
                  systemHealth?.database === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemHealth?.database === 'healthy' ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  Database
                </div>
                <div className={`text-sm ${
                  systemHealth?.database === 'healthy' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {systemHealth?.database === 'healthy' ? 'Connected' : 'Connection Issues'}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 font-semibold flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Blockchain
                </div>
                <div className="text-sm text-blue-700">Sepolia Network</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-600 font-semibold flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  PYUSD
                </div>
                <div className="text-sm text-purple-700">Ready</div>
              </div>
            </div>
            {systemHealth?.lastUpdated && (
              <div className="mt-4 text-xs text-gray-500 text-center">
                Last checked: {new Date(systemHealth.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Management Modals */}
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}

      {showJobManagement && (
        <JobManagement onClose={() => setShowJobManagement(false)} />
      )}

      {showPaymentMonitoring && (
        <PaymentMonitoring onClose={() => setShowPaymentMonitoring(false)} />
      )}

      {showAnalytics && (
        <Analytics onClose={() => setShowAnalytics(false)} />
      )}

      {showCompanyManagement && (
        <CompanyManagement onClose={() => setShowCompanyManagement(false)} />
      )}
    </div>
  )
}
