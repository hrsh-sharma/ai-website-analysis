import type { Report, JobStatus } from '@/types/report'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function submitUrl(url: string): Promise<{ report_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to start analysis')
  return data
}

export async function pollJob(reportId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/job/${reportId}`)
  return res.json()
}

export async function fetchReport(reportId: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/api/report/${reportId}`)
  if (!res.ok) throw new Error('Report not found')
  return res.json()
}

export async function fetchTechStack(url: string): Promise<{ technologies: { name: string; category: string; color: string }[] }> {
  const res = await fetch(`${API_BASE}/api/tech-stack?url=${encodeURIComponent(url)}`)
  if (!res.ok) return { technologies: [] }
  return res.json()
}
