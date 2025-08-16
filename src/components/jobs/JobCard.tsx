import { MapPin, Clock, ExternalLink, Eye } from 'lucide-react'
import { Job } from '@/lib/database.types'
import BlockchainBadge from '@/components/ui/BlockchainBadge'
import TechBadge from '@/components/ui/TechBadge'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  className?: string
}

export default function JobCard({ job, className }: JobCardProps) {
  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return null
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k ${currency}`
    }
    if (min) return `$${(min / 1000).toFixed(0)}k+ ${currency}`
    if (max) return `Up to $${(max / 1000).toFixed(0)}k ${currency}`
    return null
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 14) return '1 week ago'
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency)

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <p className="text-gray-600 font-medium">
            {job.companies.name}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {/* Primary blockchain badge */}
          {job.blockchain_networks.length > 0 && (
            <BlockchainBadge 
              network={job.blockchain_networks.length > 1 ? 'Multi-chain' : job.blockchain_networks[0]} 
            />
          )}
        </div>
      </div>

      {/* Location and Remote */}
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <MapPin className="h-4 w-4 mr-1" />
        <span>{job.location}</span>
        {job.remote && (
          <>
            <span className="mx-2">•</span>
            <span>Remote</span>
          </>
        )}
        <span className="mx-2">•</span>
        <Clock className="h-4 w-4 mr-1" />
        <span>{getTimeAgo(job.posted_at)}</span>
      </div>

      {/* Salary */}
      {salary && (
        <div className="text-lg font-semibold text-green-600 mb-3">
          {salary}
        </div>
      )}

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.tech_stack.slice(0, 3).map((tech) => (
          <TechBadge key={tech} tech={tech} />
        ))}
        {job.tech_stack.length > 3 && (
          <span className="text-sm text-gray-500">
            +{job.tech_stack.length - 3} more
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          Quick Apply
        </button>
      </div>
    </div>
  )
}
