const REPO = 'rosilvosa/reality-check'
const API = `https://api.github.com/repos/${REPO}/issues?state=open&per_page=50`

export type IssueKind = 'bug' | 'feature'

export interface Issue {
  number: number
  title: string
  url: string
  kind: IssueKind
}

type Raw = {
  number: number
  title: string
  html_url: string
  pull_request?: unknown
  labels: Array<string | { name?: string }>
}

function labelNames(labels: Raw['labels']): string[] {
  return labels.map((l) => (typeof l === 'string' ? l : l.name ?? '').toLowerCase())
}

function kindOf(labels: string[]): IssueKind {
  if (labels.some((n) => n === 'bug' || n === 'translation')) return 'bug'
  return 'feature'
}

export async function fetchOpenIssues(): Promise<Issue[]> {
  const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
  if (!res.ok) throw new Error('github')
  const rows = (await res.json()) as Raw[]
  return rows
    .filter((r) => !r.pull_request)
    .map((r) => ({
      number: r.number,
      title: r.title,
      url: r.html_url,
      kind: kindOf(labelNames(r.labels)),
    }))
}

export const ISSUES_URL = `https://github.com/${REPO}/issues`
