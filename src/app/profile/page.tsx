'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Header from '@/components/ui/Header'
import ProfileTestHelper from '@/components/profile/ProfileTestHelper'
import { getProfileByWallet } from '@/lib/profile'
import { Profile } from '@/lib/database.types'
import { fetchGitHubRepos, getMockGitHubData, GitHubRepo } from '@/lib/github'
import {
  getUserActivitySummary,
  getUserWorkHistoryBadges,
  calculateProfileScore,
  ActivitySummary,
  WorkHistoryBadge
} from '@/lib/profileActivity'
import {
  User,
  Briefcase,
  DollarSign,
  Star,
  Calendar,
  ExternalLink,
  Github,
  Loader2,
  AlertCircle,
  Trophy,
  Clock,
  BookmarkIcon
} from 'lucide-react'



export default function ProfilePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null)
  const [workHistoryBadges, setWorkHistoryBadges] = useState<WorkHistoryBadge[]>([])
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState<string | null>(null)

  // Redirect to signup if wallet not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/signup')
      return
    }
  }, [isConnected, router])

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!address) return

      setIsLoading(true)
      setError(null)

      try {
        const { profile: userProfile, error: profileError } = await getProfileByWallet(address)
        
        if (profileError) {
          setError(profileError)
          return
        }

        if (!userProfile) {
          // No profile found, redirect to create profile
          router.push('/profile/create')
          return
        }

        setProfile(userProfile)

        // Load activity summary
        const { activitySummary, error: activityError } = await getUserActivitySummary(address)
        if (activityError) {
          console.error('Error loading activity summary:', activityError)
        } else if (activitySummary) {
          setActivitySummary(activitySummary)
        }

        // Load work history badges
        const { badges, error: badgesError } = await getUserWorkHistoryBadges(address)
        if (badgesError) {
          console.error('Error loading work history badges:', badgesError)
        } else {
          setWorkHistoryBadges(badges)
        }

      } catch (error) {
        console.error('Error loading profile data:', error)
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    if (isConnected && address) {
      loadProfileData()
    }
  }, [isConnected, address, router])

  // Load GitHub repositories
  useEffect(() => {
    const loadGitHubRepos = async () => {
      if (!profile?.full_name) return

      setGithubLoading(true)
      setGithubError(null)

      try {
        // For demo purposes, use mock data
        // In a real implementation, you would extract the GitHub username from the profile
        // const githubUsername = extractGitHubUsername(profile.github_url || '')

        // Use mock data for demonstration
        const mockData = getMockGitHubData()
        setGithubRepos(mockData.repos)

        // Uncomment below for real GitHub API integration:
        // if (githubUsername) {
        //   const { repos, error } = await fetchGitHubRepos(githubUsername, 5)
        //   if (error) {
        //     setGithubError(error)
        //   } else {
        //     setGithubRepos(repos)
        //   }
        // } else {
        //   setGithubError('No GitHub username found in profile')
        // }
      } catch (error) {
        console.error('Error loading GitHub repos:', error)
        setGithubError('Failed to load GitHub repositories')
      } finally {
        setGithubLoading(false)
      }
    }

    if (profile) {
      loadGitHubRepos()
    }
  }, [profile])

  if (!isConnected) {
    return null // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading your profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-red-600">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null // Will redirect in useEffect
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Development Test Helper */}
        {process.env.NODE_ENV === 'development' && (
          <ProfileTestHelper profile={profile} />
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.full_name}
                </h1>
                <p className="text-gray-600 mb-2">
                  {profile.experience_level} Developer
                </p>
                <p className="text-sm text-gray-500">
                  Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/profile/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>
          
          {profile.bio && (
            <div className="mt-6">
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
          
          <div className="mt-6 flex flex-wrap gap-2">
            {profile.skills?.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Activity Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                <p className="text-3xl font-bold text-gray-900">{activitySummary?.completedProjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Projects</p>
                <p className="text-3xl font-bold text-gray-900">{activitySummary?.currentProjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(activitySummary?.totalEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Score</p>
                <p className="text-3xl font-bold text-gray-900">{calculateProfileScore(profile)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {activitySummary?.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <a
                    href={`https://etherscan.io/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {truncateHash(transaction.hash)}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Jobs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookmarkIcon className="h-5 w-5 mr-2 text-gray-600" />
              Saved Jobs
            </h3>
            <div className="space-y-3">
              {activitySummary?.savedJobs.map((job) => (
                <div key={job.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Saved {formatDate(job.savedAt)}
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Saved Jobs
            </button>
          </div>
        </div>

        {/* Work History Badges (NFT Achievements) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-gray-600" />
            Work History Badges (NFT Achievements)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workHistoryBadges.map((badge) => (
              <div key={badge.id} className="group relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  {/* NFT Badge Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>

                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {badge.projectTitle}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {badge.employer}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center justify-center mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      Completed {formatDate(badge.completionDate)}
                    </p>
                    {badge.skills && badge.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {badge.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-white bg-opacity-50 text-xs rounded-full text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {badge.skills.length > 3 && (
                          <span className="px-2 py-1 bg-white bg-opacity-50 text-xs rounded-full text-gray-700">
                            +{badge.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white font-medium">View NFT</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {workHistoryBadges.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No work history badges yet</p>
              <p className="text-sm text-gray-400">Complete projects to earn NFT achievement badges</p>
            </div>
          )}
        </div>

        {/* GitHub Integration */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Github className="h-5 w-5 mr-2 text-gray-600" />
            GitHub Integration
          </h3>

          {githubLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading GitHub repositories...</span>
            </div>
          ) : githubError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-2">{githubError}</p>
              <p className="text-sm text-gray-500">
                Connect your GitHub account in profile settings to display your repositories
              </p>
            </div>
          ) : githubRepos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {githubRepos.slice(0, 5).map((repo) => (
                  <div key={repo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{repo.name}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="h-3 w-3 mr-1" />
                        {repo.stargazers_count}
                      </div>
                    </div>

                    {repo.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {repo.language && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {repo.language}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Updated {formatDate(repo.updated_at)}
                        </span>
                      </div>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <a
                  href={`https://github.com/demo-developer`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Github className="h-4 w-4 mr-2" />
                  View Full GitHub Profile
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Github className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No GitHub repositories found</p>
              <p className="text-sm text-gray-400">
                Connect your GitHub account to showcase your development work
              </p>
              <button className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Connect GitHub
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
