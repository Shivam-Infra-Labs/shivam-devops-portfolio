export interface GitHubRepoProof {
  repoName: string;
  fullName: string;
  htmlUrl: string;
  language: string;
  updatedAt: string;
  formattedUpdatedAt: string;
  isLiveSynced: boolean;
}

export type GitHubRepoProofMap = Record<string, GitHubRepoProof>;

interface GitHubApiRepo {
  name?: string;
  full_name?: string;
  html_url?: string;
  language?: string | null;
  pushed_at?: string;
  updated_at?: string;
}

const STATIC_FALLBACK_REPOS: Record<
  string,
  { language: string; updatedAt: string; htmlUrl: string }
> = {
  'mean-stack-example': {
    language: 'JavaScript',
    updatedAt: '2026-03-01T00:00:00Z',
    htmlUrl: 'https://github.com/Shivam-Infra-Labs/mean-stack-example',
  },
  'Dockerized-grocery-store': {
    language: 'PHP',
    updatedAt: '2026-02-15T00:00:00Z',
    htmlUrl: 'https://github.com/Shivam-Infra-Labs/Dockerized-grocery-store',
  },
  '-Grocery-Store-Deployment-using-LAMP-Stack-DevOps-Project-': {
    language: 'Shell',
    updatedAt: '2026-01-20T00:00:00Z',
    htmlUrl:
      'https://github.com/Shivam-Infra-Labs/-Grocery-Store-Deployment-using-LAMP-Stack-DevOps-Project-',
  },
  '-Networking-Labs': {
    language: 'Cisco IOS',
    updatedAt: '2025-12-10T00:00:00Z',
    htmlUrl: 'https://github.com/Shivam-Infra-Labs/-Networking-Labs',
  },
  'gyan-vatika-library': {
    language: 'TypeScript',
    updatedAt: '2026-02-28T00:00:00Z',
    htmlUrl: 'https://github.com/Shivam-Infra-Labs/gyan-vatika-library',
  },
};

export function formatRepoDateUtc(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recent';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function extractGitHubRepoName(urlOrName: string): string | null {
  if (!urlOrName) return null;
  const trimmed = urlOrName.trim();
  const match = trimmed.match(/github\.com\/[^/]+\/([^/?#]+)/i);
  if (match && match[1]) {
    return match[1].replace(/\.git$/i, '');
  }
  const slashParts = trimmed.split('/');
  if (slashParts.length === 2 && !trimmed.includes(' ')) {
    return slashParts[1];
  }
  return null;
}

function buildFallbackMap(): GitHubRepoProofMap {
  const map: GitHubRepoProofMap = {};
  for (const [repoName, meta] of Object.entries(STATIC_FALLBACK_REPOS)) {
    map[repoName.toLowerCase()] = {
      repoName,
      fullName: `Shivam-Infra-Labs/${repoName}`,
      htmlUrl: meta.htmlUrl,
      language: meta.language,
      updatedAt: meta.updatedAt,
      formattedUpdatedAt: formatRepoDateUtc(meta.updatedAt),
      isLiveSynced: false,
    };
  }
  return map;
}

export async function fetchGitHubRepoProofMap(): Promise<GitHubRepoProofMap> {
  const proofMap = buildFallbackMap();

  try {
    const response = await fetch(
      'https://api.github.com/users/Shivam-Infra-Labs/repos?per_page=100&sort=updated',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'shivam-devops-portfolio',
        },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4500),
      }
    );

    if (!response.ok) {
      return proofMap;
    }

    const repos = (await response.json()) as GitHubApiRepo[];
    if (!Array.isArray(repos)) {
      return proofMap;
    }

    for (const repo of repos) {
      if (!repo?.name) continue;
      const key = repo.name.toLowerCase();
      const isoDate =
        repo.pushed_at ||
        repo.updated_at ||
        STATIC_FALLBACK_REPOS[repo.name]?.updatedAt ||
        '2026-01-01T00:00:00Z';

      const fallbackLang =
        STATIC_FALLBACK_REPOS[repo.name]?.language || 'Infrastructure';

      proofMap[key] = {
        repoName: repo.name,
        fullName: repo.full_name || `Shivam-Infra-Labs/${repo.name}`,
        htmlUrl:
          repo.html_url || `https://github.com/Shivam-Infra-Labs/${repo.name}`,
        language: repo.language || fallbackLang,
        updatedAt: isoDate,
        formattedUpdatedAt: formatRepoDateUtc(isoDate),
        isLiveSynced: true,
      };
    }
  } catch {
    // Graceful static fallback when offline or rate-limited
  }

  return proofMap;
}

export interface CiWorkflowStatus {
  repoFullName: string;
  workflowName: string;
  status: 'completed' | 'in_progress' | 'queued' | 'static';
  conclusion: 'success' | 'failure' | 'cancelled' | 'neutral' | 'unknown';
  shortSha: string | null;
  formattedUpdatedAt: string | null;
  htmlUrl: string;
  isLiveSynced: boolean;
}

interface GitHubWorkflowRun {
  name?: string;
  status?: string;
  conclusion?: string | null;
  head_sha?: string;
  updated_at?: string;
  html_url?: string;
}

interface GitHubActionsRunsResponse {
  workflow_runs?: GitHubWorkflowRun[];
}

export async function fetchCiWorkflowStatus(): Promise<CiWorkflowStatus> {
  const configuredRepo = process.env.GITHUB_REPOSITORY?.trim();
  const candidates = configuredRepo
    ? [configuredRepo, 'Shivam-Infra-Labs/mean-stack-example']
    : [
        'Shivam-Infra-Labs/devops-portfolio',
        'Shivam-Infra-Labs/mean-stack-example',
      ];

  for (const repoSlug of candidates) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoSlug}/actions/runs?per_page=1`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'shivam-devops-portfolio',
          },
          next: { revalidate: 900 },
          signal: AbortSignal.timeout(4500),
        }
      );

      if (!response.ok) continue;

      const payload = (await response.json()) as GitHubActionsRunsResponse;
      const latest = payload.workflow_runs?.[0];
      if (!latest) continue;

      const normalizedStatus: CiWorkflowStatus['status'] =
        latest.status === 'completed'
          ? 'completed'
          : latest.status === 'in_progress'
            ? 'in_progress'
            : 'queued';

      const normalizedConclusion: CiWorkflowStatus['conclusion'] =
        latest.conclusion === 'success'
          ? 'success'
          : latest.conclusion === 'failure'
            ? 'failure'
            : latest.conclusion === 'cancelled'
              ? 'cancelled'
              : latest.conclusion === 'neutral'
                ? 'neutral'
                : 'unknown';

      return {
        repoFullName: repoSlug,
        workflowName: latest.name || 'Portfolio CI Pipeline',
        status: normalizedStatus,
        conclusion: normalizedConclusion,
        shortSha: latest.head_sha ? latest.head_sha.slice(0, 7) : null,
        formattedUpdatedAt: latest.updated_at
          ? formatRepoDateUtc(latest.updated_at)
          : null,
        htmlUrl:
          latest.html_url || `https://github.com/${repoSlug}/actions`,
        isLiveSynced: true,
      };
    } catch {
      // Try next candidate or static fallback
    }
  }

  return {
    repoFullName: configuredRepo || 'Shivam-Infra-Labs/mean-stack-example',
    workflowName: 'Portfolio CI Pipeline',
    status: 'static',
    conclusion: 'neutral',
    shortSha: null,
    formattedUpdatedAt: null,
    htmlUrl: 'https://github.com/Shivam-Infra-Labs/mean-stack-example/actions',
    isLiveSynced: false,
  };
}
