'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  DollarSign, 
  Calendar,
  X,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Building
} from 'lucide-react'

interface AnalyticsData {
  userGrowth: {
    total: number
    thisMonth: number
    lastMonth: number
    growthRate: number
  }
  jobMetrics: {
    totalJobs: number
    activeJobs: number
    completedJobs: number
    averageTimeToFill: number
  }
  paymentMetrics: {
    totalVolume: number
    averageTransaction: number
    successRate: number
    monthlyVolume: number[]
  }
  platformMetrics: {
    conversionRate: number
    activeUsers: number
    jobApplicationRate: number
    userRetention: number
  }
  topSkills: Array<{ skill: string; count: number }>
  topCompanies: Array<{ name: string; jobCount: number; totalVolume: number }>
  monthlyStats: Array<{
    month: string
    users: number
    jobs: number
    volume: number
  }>
}

interface AnalyticsProps {
  onClose: () => void
}

export default function Analytics({ onClose }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setRefreshing(true)

      // Calculate date ranges
      const now = new Date()
      const ranges = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }
      const daysBack = ranges[timeRange]
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      const lastPeriodStart = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000)

      // Fetch user data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at, skills')
        .order('created_at', { ascending: false })

      // Fetch job data
      const { data: jobs } = await supabase
        .from('jobs')
        .select('created_at, is_active, companies(name)')
        .order('created_at', { ascending: false })

      // Fetch company data
      const { data: companies } = await supabase
        .from('companies')
        .select('name, created_at')

      // Try to fetch transaction data (may not exist)
      let transactions: any[] = []
      try {
        const { data: txData } = await supabase
          .from('transactions')
          .select('amount, status, created_at')
          .eq('status', 'completed')
        transactions = txData || []
      } catch {
        // Transactions table doesn't exist
      }

      // Process user growth
      const currentPeriodUsers = profiles?.filter(p => 
        new Date(p.created_at) >= startDate
      ) || []
      const lastPeriodUsers = profiles?.filter(p => 
        new Date(p.created_at) >= lastPeriodStart && new Date(p.created_at) < startDate
      ) || []
      
      const userGrowthRate = lastPeriodUsers.length > 0 
        ? ((currentPeriodUsers.length - lastPeriodUsers.length) / lastPeriodUsers.length) * 100 
        : 0

      // Process job metrics
      const currentJobs = jobs?.filter(j => new Date(j.created_at) >= startDate) || []
      const activeJobs = jobs?.filter(j => j.is_active) || []

      // Process skills
      const skillCounts: { [key: string]: number } = {}
      profiles?.forEach(profile => {
        if (profile.skills && Array.isArray(profile.skills)) {
          profile.skills.forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1
          })
        }
      })
      const topSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }))

      // Process company metrics
      const companyJobCounts: { [key: string]: number } = {}
      jobs?.forEach(job => {
        const companyName = (job.companies as any)?.name || 'Unknown'
        companyJobCounts[companyName] = (companyJobCounts[companyName] || 0) + 1
      })
      const topCompanies = Object.entries(companyJobCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, jobCount]) => ({ name, jobCount, totalVolume: 0 }))

      // Process payment metrics
      const currentTransactions = transactions.filter(t => 
        new Date(t.created_at) >= startDate
      )
      const totalVolume = currentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      const averageTransaction = currentTransactions.length > 0 
        ? totalVolume / currentTransactions.length 
        : 0

      // Generate monthly stats for the last 6 months
      const monthlyStats = []
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        
        const monthUsers = profiles?.filter(p => {
          const date = new Date(p.created_at)
          return date >= monthStart && date <= monthEnd
        }).length || 0

        const monthJobs = jobs?.filter(j => {
          const date = new Date(j.created_at)
          return date >= monthStart && date <= monthEnd
        }).length || 0

        const monthVolume = transactions.filter(t => {
          const date = new Date(t.created_at)
          return date >= monthStart && date <= monthEnd
        }).reduce((sum, t) => sum + (t.amount || 0), 0)

        monthlyStats.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          users: monthUsers,
          jobs: monthJobs,
          volume: monthVolume
        })
      }

      const analyticsData: AnalyticsData = {
        userGrowth: {
          total: profiles?.length || 0,
          thisMonth: currentPeriodUsers.length,
          lastMonth: lastPeriodUsers.length,
          growthRate: userGrowthRate
        },
        jobMetrics: {
          totalJobs: jobs?.length || 0,
          activeJobs: activeJobs.length,
          completedJobs: 0, // Would need escrow status
          averageTimeToFill: 0 // Would need application/completion data
        },
        paymentMetrics: {
          totalVolume,
          averageTransaction,
          successRate: 100, // All fetched transactions are completed
          monthlyVolume: monthlyStats.map(m => m.volume)
        },
        platformMetrics: {
          conversionRate: profiles && jobs ? (jobs.length / profiles.length) * 100 : 0,
          activeUsers: currentPeriodUsers.length,
          jobApplicationRate: 0, // Would need application data
          userRetention: 0 // Would need login/activity data
        },
        topSkills,
        topCompanies,
        monthlyStats
      }

      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const exportData = () => {
    if (!data) return
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', data.userGrowth.total],
      ['Active Jobs', data.jobMetrics.activeJobs],
      ['Total Volume', data.paymentMetrics.totalVolume],
      ['Conversion Rate', `${data.platformMetrics.conversionRate.toFixed(2)}%`],
      ...data.topSkills.map(skill => [`Skill: ${skill.skill}`, skill.count])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ethjobs-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-orange-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold text-blue-900">{data.userGrowth.total}</p>
                      <div className="flex items-center mt-2">
                        {data.userGrowth.growthRate >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm ${data.userGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(data.userGrowth.growthRate)}
                        </span>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Active Jobs</p>
                      <p className="text-2xl font-bold text-purple-900">{data.jobMetrics.activeJobs}</p>
                      <p className="text-sm text-purple-700 mt-2">
                        {data.jobMetrics.totalJobs} total jobs
                      </p>
                    </div>
                    <Briefcase className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Payment Volume</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(data.paymentMetrics.totalVolume)}
                      </p>
                      <p className="text-sm text-green-700 mt-2">
                        Avg: {formatCurrency(data.paymentMetrics.averageTransaction)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Conversion Rate</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {data.platformMetrics.conversionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-orange-700 mt-2">
                        Jobs per user
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Growth Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth</h3>
                  <div className="space-y-4">
                    {data.monthlyStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{stat.month}</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-blue-600 mr-1" />
                            <span className="text-sm">{stat.users}</span>
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-purple-600 mr-1" />
                            <span className="text-sm">{stat.jobs}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm">{formatCurrency(stat.volume)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Skills */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
                  <div className="space-y-3">
                    {data.topSkills.slice(0, 8).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{skill.skill}</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(skill.count / (data.topSkills[0]?.count || 1)) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{skill.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Companies */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies by Job Postings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.topCompanies.slice(0, 6).map((company, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Building className="h-8 w-8 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-600">{company.jobCount} jobs posted</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
              <p className="text-gray-500">Unable to load analytics data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
