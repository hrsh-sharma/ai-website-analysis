'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, CheckCircle2, Wrench, XCircle, AlertTriangle, Minus,
  Search, Eye, Zap, MousePointer2, Palette, ShieldCheck, BarChart2,
} from 'lucide-react'
import type { Category } from '@/types/report'
import ScoreRing from '@/components/shared/ScoreRing'

/* ── Config ── */
const CAT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  seo:           { label: 'SEO',           icon: Search,        color: '#a78bfa', bg: 'rgba(139,92,246,0.12)'  },
  accessibility: { label: 'Accessibility', icon: Eye,           color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  performance:   { label: 'Performance',   icon: Zap,           color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  ux:            { label: 'UX',            icon: MousePointer2, color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  design:        { label: 'Design',        icon: Palette,       color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  security:      { label: 'Security',      icon: ShieldCheck,   color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
}

const SEVERITY_CONFIG = {
  critical: { icon: XCircle,       color: '#f87171', bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.2)',    label: 'Critical' },
  major:    { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(234,179,8,0.08)',    border: 'rgba(234,179,8,0.2)',    label: 'Major'    },
  minor:    { icon: Minus,         color: '#94a3b8', bg: 'rgba(100,116,139,0.08)',  border: 'rgba(100,116,139,0.2)', label: 'Minor'    },
}

export default function CategoryCard({ category }: { category: Category }) {
  const [expanded, setExpanded] = useState(false)

  const cfg     = CAT_CONFIG[category.name] ?? { label: category.name, icon: BarChart2, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' }
  const Icon    = cfg.icon
  const hasContent = category.issues.length > 0 || category.good_points.length > 0

  const criticalCount = category.issues.filter(i => i.severity === 'critical').length
  const majorCount    = category.issues.filter(i => i.severity === 'major').length

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${cfg.color}22` }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* ── Card header ── */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">

          {/* Left: icon + name + summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                <Icon size={16} style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">{cfg.label}</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: cfg.color }}>
                  {category.score >= 90 ? 'Excellent' : category.score >= 75 ? 'Good' : category.score >= 60 ? 'Needs Work' : category.score >= 40 ? 'Poor' : 'Critical'}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: '#b0c8df' }}>
              {category.summary}
            </p>

            {/* Severity chips */}
            {(criticalCount > 0 || majorCount > 0) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {criticalCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}>
                    <XCircle size={9} /> {criticalCount} Critical
                  </span>
                )}
                {majorCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(234,179,8,0.08)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.18)' }}>
                    <AlertTriangle size={9} /> {majorCount} Major
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: score ring */}
          <ScoreRing score={category.score} size={76} strokeWidth={6} />
        </div>
      </div>

      {/* ── Toggle ── */}
      {hasContent && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-medium transition-all mt-auto"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: expanded ? cfg.color : '#4a6a8a',
            background: expanded ? `${cfg.bg}` : 'transparent',
          }}
          onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'transparent' }}
        >
          <span>
            {expanded
              ? 'Collapse'
              : `${category.issues.length} issue${category.issues.length !== 1 ? 's' : ''} · ${category.good_points.length} good`}
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={14} />
          </motion.div>
        </button>
      )}

      {/* ── Expanded content ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Good points */}
            {category.good_points.length > 0 && (
              <div className="p-5"
                style={{ borderBottom: category.issues.length > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3 flex items-center gap-1.5"
                  style={{ color: '#4ade80' }}>
                  <CheckCircle2 size={11} /> What&apos;s Good
                </p>
                <div className="space-y-2">
                  {category.good_points.map(p => (
                    <div key={p.id} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#4ade80' }} />
                      <p className="text-xs leading-relaxed" style={{ color: '#86c9a4' }}>{p.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues */}
            {category.issues.length > 0 && (
              <div className="p-5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#7a9ab8' }}>
                  Issues Found
                </p>
                {category.issues.map(issue => {
                  const sev = SEVERITY_CONFIG[issue.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.minor
                  const SevIcon = sev.icon
                  return (
                    <div key={issue.id} className="rounded-xl overflow-hidden"
                      style={{ border: `1px solid ${sev.border}` }}>

                      {/* Issue header */}
                      <div className="flex items-center gap-2.5 px-4 py-2.5"
                        style={{ background: sev.bg }}>
                        <SevIcon size={13} style={{ color: sev.color, flexShrink: 0 }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sev.color }}>
                          {sev.label}
                        </span>
                        <span className="text-xs font-semibold text-white ml-1 leading-snug">
                          {issue.title}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
                        <p className="text-xs leading-relaxed" style={{ color: '#b0c8df' }}>
                          {issue.description}
                        </p>
                        {issue.how_to_fix && (
                          <div className="rounded-lg p-3"
                            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Wrench size={10} style={{ color: '#60a5fa' }} />
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#60a5fa' }}>
                                How to Fix
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: '#b8ccde' }}>
                              {issue.how_to_fix}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
