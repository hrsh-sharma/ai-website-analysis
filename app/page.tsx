'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { submitUrl } from '@/lib/api'
import {
  ArrowRight, Search, Zap, Shield,
  BarChart2, Eye, Palette, Globe, Sparkles,
} from 'lucide-react'

const SAMPLE_SITES = [
  { label: 'Apple',  url: 'https://apple.com' },
  { label: 'Stripe', url: 'https://stripe.com' },
  { label: 'Linear', url: 'https://linear.app' },
  { label: 'Vercel', url: 'https://vercel.com' },
]

const FEATURES = [
  { icon: Search,  label: 'SEO',           desc: 'Title, meta, headings, OG tags',      color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
  { icon: Eye,     label: 'Accessibility', desc: 'ARIA, contrast, alt text',             color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  { icon: Zap,     label: 'Performance',   desc: 'LCP, CLS, speed index',                color: 'text-yellow-400',  bg: 'bg-yellow-500/10'  },
  { icon: Globe,   label: 'UX',            desc: 'CTA clarity, navigation, forms',       color: 'text-green-400',   bg: 'bg-green-500/10'   },
  { icon: Palette, label: 'Design',        desc: 'Typography, spacing, hierarchy',       color: 'text-pink-400',    bg: 'bg-pink-500/10'    },
  { icon: Shield,  label: 'Security',      desc: 'HTTPS, headers, CSP',                  color: 'text-cyan-400',    bg: 'bg-cyan-500/10'    },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
}

export default function HomePage() {
  const [url, setUrl]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const router = useRouter()

  async function handleAnalyze() {
    const trimmed = url.trim()
    if (!trimmed) return
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    setLoading(true)
    setError('')
    try {
      const data = await submitUrl(normalized)
      router.push(`/report/${data.report_id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen text-white overflow-hidden" style={{ background: '#080e1a' }}>

      {/* ── Background gradient blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 right-1/3 w-[350px] h-[350px] rounded-full blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative border-b px-6 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,14,26,0.7)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart2 size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-white">SiteAudit AI</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full" style={{ color: '#64a0d4', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            Free to use
          </span>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-8"
              style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}>
              <Sparkles size={11} />
              AI-powered website analysis
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-bold leading-[1.1] mb-5">
            Know exactly what&apos;s{' '}
            <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              wrong with your site
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-lg max-w-xl mx-auto mb-12" style={{ color: '#7b91b0' }}>
            Paste any URL and get an instant professional audit covering 6 categories
            with scores, issues, and actionable fixes — powered by AI.
          </motion.p>

          {/* URL Input */}
          <motion.div variants={fadeUp} className="w-full max-w-2xl">
            <div
              className="flex gap-2 p-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center pl-3" style={{ color: '#4a6080' }}>
                <Globe size={15} />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="https://yourwebsite.com"
                className="flex-1 bg-transparent text-white text-sm outline-none py-2 px-2"
                style={{ color: '#e2eaf4' }}
              />
              <motion.button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:cursor-not-allowed transition-colors"
                style={{ background: loading || !url.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: loading || !url.trim() ? '#4a6080' : 'white', boxShadow: loading || !url.trim() ? 'none' : '0 0 20px rgba(37,99,235,0.35)' }}
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Analyze
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-3 text-left pl-2"
              >
                {error}
              </motion.p>
            )}

            {/* Sample Sites */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mt-4 justify-center flex-wrap">
              <span className="text-xs" style={{ color: '#3a5070' }}>Try:</span>
              {SAMPLE_SITES.map((site) => (
                <motion.button
                  key={site.label}
                  onClick={() => setUrl(site.url)}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-xs px-3 py-1 rounded-full transition-colors"
                  style={{ color: '#7b99bb', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {site.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* ── Feature Grid ── */}
      <section className="relative max-w-4xl mx-auto px-6 py-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs uppercase tracking-widest mb-10"
          style={{ color: '#3a5272' }}
        >
          What gets analyzed
        </motion.p>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {FEATURES.map(({ icon: Icon, label, desc, color, bg }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 p-4 rounded-xl cursor-default"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon size={14} className={color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#5a7a9a' }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t py-6 text-center text-xs" style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#2e4a66' }}>
        Powered by Groq AI · Built with FastAPI + Next.js
      </footer>
    </main>
  )
}
