'use client'

import { Job } from '@/lib/database.types'
import { JobMatchScore } from '@/lib/jobMatching'
import JobCard from './JobCard'
import { Star, TrendingUp } from 'lucide-react'

interface MatchedJobsListProps {
  jobScores: JobMatchScore[]
  showMatchScore?: boolean
  title?: string
  emptyMessage?: string
}

export default function MatchedJobsList({ 
  jobScores, 
  showMatchScore = true, 
  title,
  emptyMessage = "No matching jobs found."
}: MatchedJobsListProps) {
  if (jobScores.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <TrendingUp className="h-16 w-16 mx-auto" />
        </div>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobScores.map((jobScore) => (
          <div key={jobScore.job.id} className="space-y-3">
            {/* Match Score Header */}
            {showMatchScore && (
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  jobScore.score >= 80
                    ? 'bg-green-100 text-green-800'
                    : jobScore.score >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : jobScore.score >= 40
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <Star className="h-4 w-4 mr-1" />
                  {jobScore.score}% match
                </div>
                <div className="text-sm text-gray-500">
                  {jobScore.matchedSkills.length} skills match
                </div>
              </div>
            )}

            {/* Job Card */}
            <JobCard job={jobScore.job} />

            {/* Matched Skills */}
            {showMatchScore && jobScore.matchedSkills.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs font-medium text-blue-900 mb-2">
                  Your Matching Skills
                </div>
                <div className="flex flex-wrap gap-1">
                  {jobScore.matchedSkills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {jobScore.matchedSkills.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{jobScore.matchedSkills.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Alternative component for simple job list without match scores
interface SimpleJobsListProps {
  jobs: Job[]
  title?: string
  emptyMessage?: string
}

export function SimpleJobsList({ 
  jobs, 
  title,
  emptyMessage = "No jobs found."
}: SimpleJobsListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <TrendingUp className="h-16 w-16 mx-auto" />
        </div>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
