'use client'

import { useState, useEffect, useRef } from 'react'

type RewriteResult = {
  id: string
  rewritten_text: string
  match_score: number
  key_improvements: string[]
  keywords_added: string[]
}

type Status = 'idle' | 'loading' | 'done' | 'error'

const STEPS = [
  'Analyzing your resume…',
  'Matching job requirements…',
  'Generating improvements…',
]

// ── Score gauge ─────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 900
    const start = performance.now()

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setDisplay(Math.round(eased * score))
      if (t < 1) requestAnimationFrame(tick)
    }

    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [score])

  const r = 52
  const circ = 2 * Math.PI * r
  const filled = (display / 100) * circ
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  const bg    = score >= 75 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2'
  const label = score >= 75 ? 'Strong match' : score >= 50 ? 'Fair match' : 'Weak match'

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="136" height="136" viewBox="0 0 136 136">
        {/* track */}
        <circle cx="68" cy="68" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        {/* filled arc */}
        <circle
          cx="68"
          cy="68"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 68 68)"
        />
        {/* score number */}
        <text
          x="68"
          y="63"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          style={{ fontSize: '30px', fontWeight: '700', fontFamily: 'inherit' }}
        >
          {display}
        </text>
        {/* "/100" sub-label */}
        <text
          x="68"
          y="83"
          textAnchor="middle"
          fill="#9ca3af"
          style={{ fontSize: '11px', fontFamily: 'inherit' }}
        >
          / 100
        </text>
      </svg>
      <span
        className="rounded-full px-3 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: bg, color }}
      >
        {label}
      </span>
    </div>
  )
}

// ── Loading steps ────────────────────────────────────────────

function LoadingSteps({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <SpinnerIcon />
      </div>
      <ul className="space-y-3 text-center">
        {STEPS.map((step, i) => {
          const done = i < stepIndex
          const active = i === stepIndex
          return (
            <li
              key={step}
              className={[
                'flex items-center gap-2.5 text-sm transition-colors duration-300',
                done ? 'text-gray-400 line-through' : active ? 'font-semibold text-gray-900' : 'text-gray-300',
              ].join(' ')}
            >
              <span className={[
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                done ? 'bg-green-100 text-green-600' : active ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-400',
              ].join(' ')}>
                {done ? '✓' : i + 1}
              </span>
              {step}
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-gray-400">This usually takes 10–20 seconds</p>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────

export default function RewriteEditor({
  resumeId,
  originalText,
  fileName,
  isPro,
}: {
  resumeId: string
  originalText: string
  fileName: string
  isPro: boolean
}) {
  const [jobDescription, setJobDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState<RewriteResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Advance loading steps on a timer while in-flight
  useEffect(() => {
    if (status === 'loading') {
      setStepIndex(0)
      stepTimerRef.current = setInterval(() => {
        setStepIndex(prev => Math.min(prev + 1, STEPS.length - 1))
      }, 3500)
    } else {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current)
    }
    return () => { if (stepTimerRef.current) clearInterval(stepTimerRef.current) }
  }, [status])

  // Scroll to results when done
  useEffect(() => {
    if (status === 'done') {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [status])

  async function handleRewrite() {
    if (!jobDescription.trim()) return
    setStatus('loading')
    setResult(null)
    setErrorMsg('')

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_id: resumeId, job_description: jobDescription }),
      })

      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        setErrorMsg(`Server error (${res.status}) — please try again.`)
        setStatus('error')
        return
      }

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setResult(data)
      setStatus('done')
    } catch {
      setErrorMsg('Network error — check your connection and try again.')
      setStatus('error')
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.rewritten_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownloadPDF() {
    if (!result || pdfLoading) return
    setPdfLoading(true)
    try {
      const { generateResumePDF } = await import('@/lib/pdf/resume')
      const url = await generateResumePDF(result.rewritten_text)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName.replace(/\s+/g, '-').toLowerCase()}-rewritten.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (err) {
      console.error('PDF generation failed', err)
    } finally {
      setPdfLoading(false)
    }
  }

  const canSubmit = jobDescription.trim().length > 0 && status !== 'loading'

  return (
    <div className="space-y-6">
      {/* ── Two-panel editor ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Left: original resume */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Original Resume
          </label>
          <textarea
            readOnly
            value={originalText}
            className="h-80 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-600 focus:outline-none lg:h-96"
          />
        </div>

        {/* Right: job description + action */}
        <div className="flex flex-col gap-2">
          <label htmlFor="jd" className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Job Description
          </label>
          <textarea
            id="jd"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here…"
            disabled={status === 'loading'}
            className="h-64 w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-800 placeholder-gray-300 transition-colors focus:border-gray-400 focus:outline-none disabled:opacity-60 lg:h-72"
          />

          {status === 'error' && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleRewrite}
              disabled={!canSubmit}
              className={[
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors',
                status === 'loading'
                  ? 'animate-pulse cursor-not-allowed bg-gray-950 text-white'
                  : canSubmit
                  ? 'bg-gray-950 text-white hover:bg-gray-800'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400',
              ].join(' ')}
            >
              {status === 'loading' ? (
                <>
                  <SpinnerIcon className="text-white/60" />
                  Rewriting…
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Rewrite Resume
                </>
              )}
            </button>
            {isPro && (
              <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                ✦ Unlimited
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading progress ─────────────────────────────── */}
      {status === 'loading' && (
        <div className="rounded-2xl border border-gray-100 bg-white">
          <LoadingSteps stepIndex={stepIndex} />
        </div>
      )}

      {/* ── Results ─────────────────────────────────────── */}
      {status === 'done' && result && (
        <div ref={resultsRef} className="space-y-5">

          {/* Score + lists row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Match score gauge */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Match Score
              </p>
              <ScoreGauge score={result.match_score} />
            </div>

            {/* Key improvements */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Key Improvements
              </p>
              <ul className="space-y-2">
                {result.key_improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 shrink-0 text-green-500">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Keywords added */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Keywords Added
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords_added.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Rewritten resume */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Rewritten Resume
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pdfLoading ? <SpinnerIcon className="text-gray-400" /> : <DownloadIcon />}
                  {pdfLoading ? 'Preparing…' : 'Download PDF'}
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={result.rewritten_text}
              className="h-96 w-full resize-y rounded-xl border border-gray-100 bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-700 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────

function SparklesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={['animate-spin', className].filter(Boolean).join(' ')}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
