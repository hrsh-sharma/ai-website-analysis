'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pollJob, fetchReport, fetchTechStack } from '@/lib/api'
import type { Report } from '@/types/report'
import ScoreRing from '@/components/shared/ScoreRing'
import CategoryCard from '@/components/report/CategoryCard'
import AiChat from '@/components/report/AiChat'
import {
  ArrowLeft, ExternalLink, BarChart2, AlertTriangle,
  AlertCircle, AlertOctagon, CheckCircle, Share2, Download,
  Search, Eye, Zap, MousePointer2, Palette, ShieldCheck,
} from 'lucide-react'

/* ── Constants ── */
const LOADING_STEPS = [
  'Fetching page HTML…',
  'Running SEO checks…',
  'Checking accessibility…',
  'Measuring performance…',
  'Analyzing security…',
  'Generating AI report…',
]

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

/* ── Category config ── */
const CAT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; glow: string }> = {
  seo:           { label: 'SEO',           icon: Search,       color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  glow: 'rgba(139,92,246,0.25)' },
  accessibility: { label: 'Accessibility', icon: Eye,          color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  glow: 'rgba(56,189,248,0.25)' },
  performance:   { label: 'Performance',   icon: Zap,          color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  glow: 'rgba(251,191,36,0.25)' },
  ux:            { label: 'UX',            icon: MousePointer2,color: '#34d399', bg: 'rgba(52,211,153,0.12)',  glow: 'rgba(52,211,153,0.25)' },
  design:        { label: 'Design',        icon: Palette,      color: '#f472b6', bg: 'rgba(244,114,182,0.12)', glow: 'rgba(244,114,182,0.25)' },
  security:      { label: 'Security',      icon: ShieldCheck,  color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  glow: 'rgba(74,222,128,0.25)' },
}

function scoreColor(s: number) {
  if (s >= 90) return '#4ade80'
  if (s >= 75) return '#60a5fa'
  if (s >= 60) return '#facc15'
  if (s >= 40) return '#fb923c'
  return '#f87171'
}
function scoreLabel(s: number) {
  if (s >= 90) return 'Excellent'
  if (s >= 75) return 'Good'
  if (s >= 60) return 'Needs Work'
  if (s >= 40) return 'Poor'
  return 'Critical'
}

/* ── Loading Screen ── */
function LoadingScreen() {
  const [step, setStep] = useState(0)
  const [dots, setDots] = useState('')
  useEffect(() => {
    const s = setInterval(() => setStep(p => Math.min(p + 1, LOADING_STEPS.length - 1)), 4000)
    const d = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 500)
    return () => { clearInterval(s); clearInterval(d) }
  }, [])

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-6" style={{ background: '#080e1a' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center relative">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BarChart2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">SiteAudit AI</span>
        </div>
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full" style={{ border: '3px solid rgba(255,255,255,0.05)' }} />
          <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '3px solid transparent', borderTopColor: '#3b82f6', animationDuration: '1s' }} />
          <div className="absolute inset-[6px] rounded-full animate-spin" style={{ border: '2px solid transparent', borderTopColor: '#818cf8', animationDuration: '1.8s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart2 size={18} style={{ color: '#3b82f6' }} />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Analyzing your website</h2>
        <p className="text-sm text-center mb-8" style={{ color: '#5a7a9a' }}>Runs 6 checks in parallel · usually 15–25 seconds</p>
        <div className="rounded-2xl px-7 py-5 w-full max-w-sm"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <motion.p key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            className="text-sm font-medium mb-4" style={{ color: '#60a5fa' }}>
            {LOADING_STEPS[step]}{dots}
          </motion.p>
          <div className="flex gap-1.5">
            {LOADING_STEPS.map((_, i) => (
              <motion.div key={i} animate={{ backgroundColor: i <= step ? '#3b82f6' : 'rgba(255,255,255,0.07)' }}
                transition={{ duration: 0.4 }} className="h-1 flex-1 rounded-full" />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Error Screen ── */
function ErrorScreen({ message }: { message: string }) {
  const router = useRouter()
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-6 text-center" style={{ background: '#080e1a' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
        <p className="text-sm mb-8 max-w-sm leading-relaxed" style={{ color: '#5a7a9a' }}>{message}</p>
        <motion.button onClick={() => router.push('/')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-xl transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
          <ArrowLeft size={14} /> Try Again
        </motion.button>
      </motion.div>
    </div>
  )
}

/* ── Score Mini Card ── */
function ScoreMiniCard({ category }: { category: Report['categories'][0] }) {
  const cfg   = CAT_CONFIG[category.name]
  const Icon  = cfg?.icon ?? BarChart2
  const color = cfg?.color ?? '#60a5fa'
  const bg    = cfg?.bg ?? 'rgba(59,130,246,0.12)'
  const sc    = scoreColor(category.score)
  const pct   = category.score

  return (
    <motion.div variants={fadeUp} className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sc }}>
          {scoreLabel(category.score)}
        </span>
      </div>
      <div>
        <div className="text-2xl font-bold mb-0.5" style={{ color: sc }}>{category.score}</div>
        <div className="text-xs font-semibold" style={{ color: '#c4d4e8' }}>{cfg?.label ?? category.name}</div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: sc }} />
      </div>
    </motion.div>
  )
}

/* ── Main Page ── */
export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [report, setReport]     = useState<Report | null>(null)
  const [status, setStatus]     = useState<'loading' | 'done' | 'failed'>('loading')
  const [errorMsg, setErrorMsg] = useState('Something went wrong during analysis.')
  const [techStack, setTechStack] = useState<{ name: string; category: string; color: string }[]>([])
  const [copied, setCopied]     = useState(false)
  const router = useRouter()

  useEffect(() => {
    const startedAt = Date.now()
    const interval = setInterval(async () => {
      if (Date.now() - startedAt > 3 * 60 * 1000) {
        clearInterval(interval)
        setErrorMsg('Analysis timed out after 3 minutes. Please try again.')
        setStatus('failed')
        return
      }
      try {
        const job = await pollJob(id)
        if (job.done) {
          clearInterval(interval)
          const full = await fetchReport(id)
          setReport(full)
          setStatus('done')
          // Fetch tech stack in background
          fetchTechStack(full.url).then(d => setTechStack(d.technologies))
        } else if (job.failed) {
          clearInterval(interval)
          setErrorMsg('Analysis failed. The site may be unreachable or blocked.')
          setStatus('failed')
        }
      } catch {
        clearInterval(interval)
        setErrorMsg('Could not connect to the analysis server.')
        setStatus('failed')
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [id])

  if (status === 'failed')             return <ErrorScreen message={errorMsg} />
  if (status === 'loading' || !report) return <LoadingScreen />

  const hostname      = (() => { try { return new URL(report.url).hostname } catch { return report.url } })()
  const allIssues     = report.categories.flatMap(c => c.issues)
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length
  const majorCount    = allIssues.filter(i => i.severity === 'major').length
  const minorCount    = allIssues.filter(i => i.severity === 'minor').length

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePDF() {
    window.print()
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#080e1a' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 right-0 w-[600px] h-[600px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar ── */}
      <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 px-6 py-4"
        style={{ background: 'rgba(8,14,26,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#8aaac8' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e2eaf4')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8aaac8')}>
            <ArrowLeft size={15} /> New Audit
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart2 size={15} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">SiteAudit AI</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button onClick={handleShare} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: copied ? '#4ade80' : '#8aaac8', border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}>
              <Share2 size={12} /> {copied ? 'Copied!' : 'Share'}
            </motion.button>
            <motion.button onClick={handlePDF} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#8aaac8', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Download size={12} /> PDF
            </motion.button>
            <a href={report.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#8aaac8', border: '1px solid rgba(255,255,255,0.08)' }}>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </motion.nav>

      <div className="relative max-w-6xl mx-auto px-6 py-10 space-y-6">

        {/* ── Hero Card ── */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Top accent bar */}
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #818cf8, #34d399)' }} />

          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

              {/* Left */}
              <motion.div variants={fadeUp} className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: '#6a8faf' }}>
                  Website Audit Report
                </p>
                <h1 className="text-3xl font-bold text-white mb-1 truncate">{hostname}</h1>
                <p className="text-xs mb-5" style={{ color: '#6a8faf' }}>
                  {new Date(report.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {report.overall_summary && (
                  <p className="text-sm leading-relaxed mb-6 max-w-2xl" style={{ color: '#b0c8df' }}>
                    {report.overall_summary}
                  </p>
                )}

                {/* Issue summary chips */}
                <div className="flex gap-2.5 flex-wrap">
                  {criticalCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}>
                      <AlertOctagon size={11} /> {criticalCount} Critical
                    </div>
                  )}
                  {majorCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full"
                      style={{ background: 'rgba(234,179,8,0.08)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.18)' }}>
                      <AlertCircle size={11} /> {majorCount} Major
                    </div>
                  )}
                  {minorCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full"
                      style={{ background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.18)' }}>
                      <CheckCircle size={11} /> {minorCount} Minor
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#8aaac8', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {allIssues.length} Total Issues
                  </div>
                </div>
              </motion.div>

              {/* Right — score ring */}
              <motion.div variants={fadeUp} className="shrink-0">
                <ScoreRing score={report.overall_score} size={160} strokeWidth={12} label="Overall Score" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── 6 Score Mini Cards ── */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {report.categories.map(cat => (
            <ScoreMiniCard key={cat.id} category={cat} />
          ))}
        </motion.div>

        {/* ── Screenshot ── */}
        {report.screenshot_url && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444', opacity: 0.7 }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#eab308', opacity: 0.7 }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e', opacity: 0.7 }} />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[11px] px-4 py-1 rounded-full" style={{ color: '#4a6a8a', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {report.url}
                </span>
              </div>
            </div>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${report.screenshot_url}`}
              alt={`Screenshot of ${report.url}`}
              className="w-full object-cover"
              style={{ maxHeight: '360px' }}
            />
          </motion.div>
        )}

        {/* ── Tech Stack ── */}
        {techStack.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: '#7a9ab8' }}>
              Detected Tech Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {techStack.map(tech => (
                <span key={tech.name}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: `${tech.color}14`, color: tech.color, border: `1px solid ${tech.color}30` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tech.color }} />
                  {tech.name}
                  <span className="text-[9px] opacity-60 font-normal">{tech.category}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Detailed Breakdown ── */}
        <div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#7a9ab8' }}>
              Detailed Breakdown
            </p>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </motion.div>

          {report.categories.length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ color: '#3a5272', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <AlertTriangle size={32} className="mx-auto mb-3 opacity-40" />
              <p>No category data found. Try analyzing again.</p>
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {report.categories.map(category => (
                <motion.div key={category.id} variants={fadeUp}>
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── AI Chat floating button ── */}
      <AiChat reportId={id} />
    </div>
  )
}
