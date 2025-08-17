import { Job } from './database.types'

export interface JobMatchScore {
  job: Job
  score: number
  matchedSkills: string[]
  matchPercentage: number
}

export interface JobFilters {
  skills?: string[]
  availableDate?: string
  experienceLevel?: string
  location?: string
  remote?: boolean
  salaryMin?: number
  salaryMax?: number
}

/**
 * Calculate match score between user skills and job requirements
 */
export function calculateJobMatchScore(job: Job, userSkills: string[]): JobMatchScore {
  if (!userSkills.length || !job.tech_stack.length) {
    return {
      job,
      score: 0,
      matchedSkills: [],
      matchPercentage: 0
    }
  }

  // Normalize skills for comparison (lowercase, trim)
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim())
  const normalizedJobSkills = job.tech_stack.map(skill => skill.toLowerCase().trim())

  // Find exact matches
  const exactMatches = normalizedUserSkills.filter(userSkill =>
    normalizedJobSkills.includes(userSkill)
  )

  // Find partial matches (for skills that might be similar but not exact)
  const partialMatches = normalizedUserSkills.filter(userSkill =>
    normalizedJobSkills.some(jobSkill =>
      jobSkill.includes(userSkill) || userSkill.includes(jobSkill)
    )
  ).filter(skill => !exactMatches.includes(skill))

  // Calculate match percentage
  const totalJobSkills = job.tech_stack.length
  const matchedSkillsCount = exactMatches.length + (partialMatches.length * 0.5)
  const matchPercentage = Math.round((matchedSkillsCount / totalJobSkills) * 100)

  // Calculate score (0-100)
  // Exact matches get full points, partial matches get half points
  const exactMatchScore = (exactMatches.length / totalJobSkills) * 80
  const partialMatchScore = (partialMatches.length / totalJobSkills) * 20
  const score = Math.min(100, Math.round(exactMatchScore + partialMatchScore))

  // Get original case matched skills for display
  const matchedSkills = job.tech_stack.filter(jobSkill =>
    normalizedUserSkills.some(userSkill =>
      jobSkill.toLowerCase().trim() === userSkill ||
      jobSkill.toLowerCase().includes(userSkill) ||
      userSkill.includes(jobSkill.toLowerCase().trim())
    )
  )

  return {
    job,
    score,
    matchedSkills,
    matchPercentage
  }
}

/**
 * Filter and sort jobs based on user criteria
 */
export function filterAndRankJobs(
  jobs: Job[],
  filters: JobFilters
): JobMatchScore[] {
  const filteredJobs = jobs.filter(job => {
    // Filter by availability date
    if (filters.availableDate) {
      const availableDate = new Date(filters.availableDate)
      const jobPostedDate = new Date(job.posted_at)
      
      // Only show jobs posted recently or that might still be available
      const daysDifference = Math.abs(availableDate.getTime() - jobPostedDate.getTime()) / (1000 * 3600 * 24)
      if (daysDifference > 90) { // Jobs older than 90 days might not be relevant
        return false
      }
    }

    // Filter by experience level
    if (filters.experienceLevel) {
      const userLevel = filters.experienceLevel.toLowerCase()
      const jobLevel = job.experience_level.toLowerCase()
      
      // Allow some flexibility in experience level matching
      const levelHierarchy = ['entry', 'mid', 'senior', 'lead', 'executive']
      const userLevelIndex = levelHierarchy.indexOf(userLevel)
      const jobLevelIndex = levelHierarchy.indexOf(jobLevel)
      
      // User can apply to jobs at their level or one level below
      if (userLevelIndex !== -1 && jobLevelIndex !== -1) {
        if (jobLevelIndex > userLevelIndex + 1) {
          return false
        }
      }
    }

    // Filter by remote preference
    if (filters.remote !== undefined && !job.remote && filters.remote) {
      return false
    }

    // Filter by salary range
    if (filters.salaryMin && job.salary_max && job.salary_max < filters.salaryMin) {
      return false
    }
    if (filters.salaryMax && job.salary_min && job.salary_min > filters.salaryMax) {
      return false
    }

    // Filter by location (if not remote)
    if (filters.location && !job.remote) {
      const userLocation = filters.location.toLowerCase()
      const jobLocation = job.location.toLowerCase()
      if (!jobLocation.includes(userLocation) && !userLocation.includes(jobLocation)) {
        return false
      }
    }

    return job.is_active
  })

  // Calculate match scores for filtered jobs
  const jobsWithScores = filteredJobs.map(job =>
    calculateJobMatchScore(job, filters.skills || [])
  )

  // Sort by match score (highest first), then by posted date (newest first)
  return jobsWithScores.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score
    }
    return new Date(b.job.posted_at).getTime() - new Date(a.job.posted_at).getTime()
  })
}

/**
 * Get job recommendations based on user profile
 */
export function getJobRecommendations(
  jobs: Job[],
  userSkills: string[],
  minMatchScore: number = 20
): JobMatchScore[] {
  const jobsWithScores = jobs.map(job =>
    calculateJobMatchScore(job, userSkills)
  )

  // Filter jobs with minimum match score and sort by score
  return jobsWithScores
    .filter(jobScore => jobScore.score >= minMatchScore)
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score
      }
      return new Date(b.job.posted_at).getTime() - new Date(a.job.posted_at).getTime()
    })
}

/**
 * Categorize jobs by match quality
 */
export function categorizeJobsByMatch(jobScores: JobMatchScore[]) {
  return {
    excellent: jobScores.filter(js => js.score >= 80),
    good: jobScores.filter(js => js.score >= 60 && js.score < 80),
    fair: jobScores.filter(js => js.score >= 40 && js.score < 60),
    poor: jobScores.filter(js => js.score >= 20 && js.score < 40)
  }
}

/**
 * Get skills that appear most frequently in job postings
 */
export function getPopularSkills(jobs: Job[]): { skill: string; count: number }[] {
  const skillCounts: { [key: string]: number } = {}

  jobs.forEach(job => {
    job.tech_stack.forEach(skill => {
      const normalizedSkill = skill.trim()
      skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1
    })
  })

  return Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
}
