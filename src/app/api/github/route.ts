
const GITHUB_API_BASE = 'https://api.github.com';

// Helper function to parse GitHub issue URL
function parseGitHubIssueUrl(url: string) {
  try {
    // Handle different GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/,
      /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/,
      /github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)#.*/,
      /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)#.*/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
          issueNumber: parseInt(match[3])
        };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Helper function to fetch GitHub issue data
async function fetchGitHubIssue(owner: string, repo: string, issueNumber: number) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EthJobs-App',
        // Note: For public repos, no authentication is required
        // For private repos or higher rate limits, you'd need a GitHub token
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const issue = await response.json();
    return issue;
  } catch (error) {
    console.error('Error fetching GitHub issue:', error);
    throw error;
  }
}

// Helper function to fetch issue comments
async function fetchIssueComments(owner: string, repo: string, issueNumber: number) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EthJobs-App',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const comments = await response.json();
    return comments;
  } catch (error) {
    console.error('Error fetching issue comments:', error);
    throw error;
  }
}

// GET endpoint that returns GitHub issue information
export async function GET(request: Request) {
  try {
    // Get query parameters for customization
    const { searchParams } = new URL(request.url);
    const githubUrl = searchParams.get('url');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const issueNumber = searchParams.get('issue');
    
    let parsedData;
    
    // If GitHub URL is provided, parse it
    if (githubUrl) {
      parsedData = parseGitHubIssueUrl(githubUrl);
      if (!parsedData) {
                    return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid GitHub issue URL format' 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          } 
        }
      );
      }
    } else if (owner && repo && issueNumber) {
      // Use individual parameters if provided
      const issueNum = parseInt(issueNumber);
      if (isNaN(issueNum) || issueNum < 1) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid issue number. Must be a positive integer.' 
          }),
          { 
            status: 400, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            } 
          }
        );
      }
      parsedData = { owner, repo, issueNumber: issueNum };
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Either provide a GitHub issue URL or owner/repo/issue parameters' 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          } 
        }
      );
    }
    
    const { owner: finalOwner, repo: finalRepo, issueNumber: finalIssueNumber } = parsedData;

    // Fetch both issue and comments data
    const [issue, comments] = await Promise.all([
      fetchGitHubIssue(finalOwner, finalRepo, finalIssueNumber),
      fetchIssueComments(finalOwner, finalRepo, finalIssueNumber)
    ]);

    // Check if any comment contains "closed by" text
    const closedByComment = comments.find((comment: any) => 
      comment.body?.toLowerCase().includes('closed by')
    );

    // Extract PR number if found
    let prMessage = null;
    let prLink = null;
    
    if (closedByComment) {
      const prMatch = closedByComment.body.match(/#(\d+)/);
      if (prMatch) {
        const prNumber = prMatch[1];
        prMessage = `This task was completed by Pull Request #${prNumber}`;
        prLink = `https://github.com/${finalOwner}/${finalRepo}/pull/${prNumber}`;
      }
    }

    // Format the response with flattened structure
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      state: issue.state,
      message: prMessage || null,
      link: prLink || null,
      isPayable: issue.state === 'closed'
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('Error in GitHub API route:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch GitHub issue data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        } 
      }
    );
  }
}

// POST endpoint for custom GitHub API requests
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { owner, repo, issue, endpoint } = body;

    if (!owner || !repo) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Owner and repo are required parameters' 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          } 
        }
      );
    }

    let url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
    
    if (endpoint) {
      url += `/${endpoint}`;
      if (issue) {
        url += `/${issue}`;
      }
    } else if (issue) {
      url += `/issues/${issue}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EthJobs-App',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      endpoint: url,
      data: data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('Error in GitHub API POST route:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch custom GitHub data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        } 
      }
    );
  }
}

// OPTIONS endpoint for CORS preflight requests
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // Cache preflight for 24 hours
    }
  });
}
