export interface Issue {
  id: string
  severity: 'critical' | 'major' | 'minor'
  title: string
  description: string
  how_to_fix: string
}

export interface GoodPoint {
  id: string
  text: string
}

export interface Category {
  id: string
  name: string
  score: number
  summary: string
  issues: Issue[]
  good_points: GoodPoint[]
}

export interface Report {
  id: string
  url: string
  screenshot_url: string | null
  overall_score: number
  overall_summary: string | null
  status: string
  created_at: string
  categories: Category[]
}

export interface JobStatus {
  report_id: string
  status: string
  done: boolean
  failed: boolean
}
