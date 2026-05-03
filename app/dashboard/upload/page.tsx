'use client'

import { useState, useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { useRouter } from 'next/navigation'

const MAX_SIZE = 5 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryable, setRetryable] = useState(false)

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError(null)
    setRetryable(false)
    if (rejected.length > 0) {
      const code = rejected[0].errors[0]?.code
      if (code === 'file-too-large') setError('File exceeds 5 MB. Please choose a smaller PDF.')
      else if (code === 'file-invalid-type') setError('Only PDF files are accepted. Please select a .pdf file.')
      else setError('Invalid file. Upload a PDF under 5 MB.')
      return
    }
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading,
  })

  function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    setRetryable(false)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        router.push('/dashboard/resumes')
      } else {
        let msg = 'Upload failed. Please try again.'
        try {
          const body = JSON.parse(xhr.responseText)
          if (body.error) msg = body.error
        } catch { /* ignore */ }
        setError(msg)
        setRetryable(true)
        setUploading(false)
      }
    })

    xhr.addEventListener('error', () => {
      setError('Network error — check your connection and try again.')
      setRetryable(true)
      setUploading(false)
    })

    xhr.open('POST', '/api/resume/upload')
    xhr.send(formData)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc,#eef2f7_42%,#e5e7eb)] flex items-center justify-center px-4 py-12">
      {/* ── Progress toast ───────────────────────────────────── */}
      {uploading && (
        <div className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl shadow-gray-200/60">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white">
              <Spinner />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-900">{file?.name}</p>
              <p className="text-xs text-gray-400">
                {progress < 100 ? `Uploading… ${progress}%` : 'Processing…'}
              </p>
            </div>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-950 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg shadow-gray-900/20">
            <span className="text-lg font-bold tracking-tight">RA</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Upload your resume</h1>
          <p className="mt-2 text-sm text-gray-500">Upload a PDF to get started with AI-powered rewrites.</p>
        </div>

        <div className="bg-white/95 rounded-3xl shadow-xl shadow-gray-200/70 border border-white p-8 space-y-5">
          {/* Dropzone — hidden once a file is selected */}
          {!file && (
            <div
              {...getRootProps()}
              className={[
                'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-gray-950 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/60',
              ].join(' ')}
            >
              <input {...getInputProps()} />
              <div className={[
                'mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                isDragActive ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-400',
              ].join(' ')}>
                <CloudUploadIcon />
              </div>
              {isDragActive ? (
                <p className="text-sm font-semibold text-gray-950">Drop your PDF here</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-700">
                    Drag &amp; drop your PDF, or{' '}
                    <span className="text-gray-950 underline underline-offset-2">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">PDF only · max 5 MB</p>
                </>
              )}
            </div>
          )}

          {/* File preview */}
          {file && !uploading && (
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
                <PDFIcon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                aria-label="Remove file"
              >
                <XIcon />
              </button>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
                  {progress < 100 ? <Spinner /> : <PDFIcon />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{file?.name}</p>
                  <p className="text-xs text-gray-400">
                    {progress < 100 ? 'Uploading…' : 'Processing…'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gray-950 tabular-nums">
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-950 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <AlertIcon />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-700">{error}</p>
                {retryable && (
                  <button
                    onClick={handleUpload}
                    type="button"
                    className="mt-1.5 text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => router.push('/dashboard')}
              type="button"
              disabled={uploading}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              type="button"
              disabled={!file || uploading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading && <Spinner />}
              {uploading ? (progress < 100 ? 'Uploading…' : 'Processing…') : 'Upload resume'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-red-500">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function CloudUploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function PDFIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
