export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  updated_at: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
  topics: string[]
}

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

/**
 * Fetch GitHub user repositories
 */
export async function fetchGitHubRepos(username: string, limit: number = 5): Promise<{
  repos: GitHubRepo[]
  error: string | null
}> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=${limit}&type=public`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ETHJobs-App',
        },
        // Add cache control for better performance
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return { repos: [], error: 'GitHub user not found' }
      }
      if (response.status === 403) {
        return { repos: [], error: 'GitHub API rate limit exceeded' }
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const repos = await response.json()
    return { repos, error: null }
  } catch (error) {
    console.error('Error fetching GitHub repos:', error)
    return { 
      repos: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch GitHub repositories' 
    }
  }
}

/**
 * Fetch GitHub user profile
 */
export async function fetchGitHubUser(username: string): Promise<{
  user: GitHubUser | null
  error: string | null
}> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ETHJobs-App',
        },
        next: { revalidate: 600 } // Cache for 10 minutes
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return { user: null, error: 'GitHub user not found' }
      }
      if (response.status === 403) {
        return { user: null, error: 'GitHub API rate limit exceeded' }
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const user = await response.json()
    return { user, error: null }
  } catch (error) {
    console.error('Error fetching GitHub user:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch GitHub user' 
    }
  }
}

/**
 * Extract GitHub username from various GitHub URL formats
 */
export function extractGitHubUsername(input: string): string | null {
  if (!input) return null

  // Remove whitespace
  input = input.trim()

  // If it's just a username (no URL)
  if (!/^https?:\/\//.test(input) && !input.includes('/')) {
    return input
  }

  // Handle GitHub URLs
  const githubUrlRegex = /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)/
  const match = input.match(githubUrlRegex)
  
  if (match && match[1]) {
    return match[1]
  }

  return null
}

/**
 * Validate GitHub username format
 */
export function isValidGitHubUsername(username: string): boolean {
  if (!username) return false
  
  // GitHub username rules:
  // - May only contain alphanumeric characters or single hyphens
  // - Cannot begin or end with a hyphen
  // - Maximum 39 characters
  const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/
  
  return githubUsernameRegex.test(username)
}

/**
 * Get mock GitHub data for demo purposes
 */
export function getMockGitHubData(): {
  repos: GitHubRepo[]
  user: GitHubUser
} {
  return {
    repos: [
      {
        id: 1,
        name: 'defi-trading-bot',
        description: 'Automated DeFi trading bot with yield farming strategies',
        html_url: 'https://github.com/demo/defi-trading-bot',
        updated_at: '2024-01-15T10:30:00Z',
        language: 'TypeScript',
        stargazers_count: 245,
        forks_count: 67,
        open_issues_count: 12,
        default_branch: 'main',
        topics: ['defi', 'trading', 'ethereum', 'web3']
      },
      {
        id: 2,
        name: 'nft-marketplace-contracts',
        description: 'Smart contracts for a decentralized NFT marketplace',
        html_url: 'https://github.com/demo/nft-marketplace-contracts',
        updated_at: '2024-01-12T14:20:00Z',
        language: 'Solidity',
        stargazers_count: 189,
        forks_count: 43,
        open_issues_count: 8,
        default_branch: 'main',
        topics: ['nft', 'marketplace', 'solidity', 'ethereum']
      },
      {
        id: 3,
        name: 'web3-portfolio-tracker',
        description: 'Track your Web3 portfolio across multiple chains',
        html_url: 'https://github.com/demo/web3-portfolio-tracker',
        updated_at: '2024-01-08T09:15:00Z',
        language: 'React',
        stargazers_count: 156,
        forks_count: 29,
        open_issues_count: 5,
        default_branch: 'main',
        topics: ['portfolio', 'web3', 'react', 'multichain']
      },
      {
        id: 4,
        name: 'dao-governance-tools',
        description: 'Tools for DAO governance and proposal management',
        html_url: 'https://github.com/demo/dao-governance-tools',
        updated_at: '2024-01-05T16:45:00Z',
        language: 'JavaScript',
        stargazers_count: 98,
        forks_count: 21,
        open_issues_count: 3,
        default_branch: 'main',
        topics: ['dao', 'governance', 'web3', 'ethereum']
      },
      {
        id: 5,
        name: 'cross-chain-bridge',
        description: 'Secure cross-chain asset bridge implementation',
        html_url: 'https://github.com/demo/cross-chain-bridge',
        updated_at: '2024-01-02T11:30:00Z',
        language: 'Rust',
        stargazers_count: 312,
        forks_count: 78,
        open_issues_count: 15,
        default_branch: 'main',
        topics: ['bridge', 'cross-chain', 'rust', 'blockchain']
      }
    ],
    user: {
      login: 'demo-developer',
      id: 12345,
      avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
      html_url: 'https://github.com/demo-developer',
      name: 'Demo Developer',
      company: 'Web3 Innovations',
      blog: 'https://demo-developer.dev',
      location: 'San Francisco, CA',
      email: null,
      bio: 'Full-stack Web3 developer passionate about DeFi and NFTs',
      public_repos: 42,
      followers: 1250,
      following: 180,
      created_at: '2020-03-15T08:30:00Z'
    }
  }
}
