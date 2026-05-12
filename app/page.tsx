'use client'

import { useState, useRef } from 'react'

const LOGO = "https://i.imgur.com/szjzoxt.png"

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [templateFiles, setTemplateFiles] = useState<File[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [previewData, setPreviewData] = useState<Record<string, string>[] | null>(null)
  const excelRef = useRef<HTMLInputElement>(null)
  const templateRef = useRef<HTMLInputElement>(null)

  const handlePasswordSubmit = () => {
    if (passwordInput === 'BOP2026') {
      setAuthenticated(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const handleExcelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setExcelFile(file)
    const formData = new FormData()
    formData.append('excel', file)
    try {
      const res = await fetch('/api/preview', { method: 'POST', body: formData })
      const data = await res.json()
      setPreviewData(data.rows)
    } catch {
      // preview is optional
    }
  }

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setTemplateFiles(files)
    if (files.length > 0) setSelectedTemplate(files[0].name)
  }

  const handleGenerate = async () => {
    if (!excelFile || templateFiles.length === 0) {
      setMessage('Please upload both an Excel file and at least one template.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setMessage('Generating documents...')

    const formData = new FormData()
    formData.append('excel', excelFile)
    templateFiles.forEach(f => formData.append('templates', f))

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lease-documents-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
      setMessage('✅ Documents generated and downloaded!')
    } catch (err: unknown) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (!authenticated) {
    return (
      <main style={{
        minHeight: '100vh',
        background: '#0f1117',
        fontFamily: "'Georgia', serif",
        color: '#e8e0d0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#0d0f14',
          border: '1px solid #2a2a3a',
          borderRadius: 12,
          padding: '48px 40px',
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
        }}>
          <img
            src={LOGO}
            alt="BOP Acquisition Logo"
            style={{ width: 140, height: 140, objectFit: 'contain', margin: '0 auto 24px', display: 'block' }}
          />
          <div style={{ fontSize: 20, fontWeight: 600, color: '#c8a96e', marginBottom: 4 }}>
            BOP ACQUISITION
          </div>
          <div style={{ fontSize: 12, color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 32 }}>
            Lease Generator
          </div>
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
            onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#0f1117',
              border: `1px solid ${passwordError ? '#8b2020' : '#2a2a3a'}`,
              borderRadius: 6,
              color: '#e8e0d0',
              fontSize: 15,
              fontFamily: "'Georgia', serif",
              boxSizing: 'border-box',
              marginBottom: 12,
              outline: 'none',
            }}
          />
          {passwordError && (
            <div style={{ color: '#e07070', fontSize: 13, marginBottom: 12 }}>
              Incorrect password. Please try again.
            </div>
          )}
          <button
            onClick={handlePasswordSubmit}
            style={{
              width: '100%',
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #c8a96e, #8b6914)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 15,
              fontFamily: "'Georgia', serif",
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            Enter
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0f1117',
      fontFamily: "'Georgia', serif",
      color: '#e8e0d0',
      padding: '0',
    }}>
      <header style={{
        borderBottom: '1px solid #2a2a3a',
        padding: '16px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0d0f14',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={LOGO}
            alt="BOP Acquisition Logo"
            style={{ width: 52, height: 52, objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.04em', color: '#c8a96e' }}>
              BOP ACQUISITION
            </div>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Lease Generator
            </div>
          </div>
        </div>
        <a href="/help" style={{
          color: '#c8a96e', fontSize: 13, textDecoration: 'none',
          border: '1px solid #333', padding: '6px 14px', borderRadius: 4,
          letterSpacing: '0.04em',
        }}>User Guide</a>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 400, color: '#e8e0d0',
            margin: '0 0 12px 0', letterSpacing: '-0.01em', lineHeight: 1.2,
          }}>
            Generate Lease Documents
          </h1>
          <p style={{ color: '#888', fontSize: 15, margin: 0, lineHeight: 1.6 }}>
            Upload your Excel spreadsheet and lease template(s). The app will generate
            one Word document per row, then package them into a ZIP for download.
          </p>
        </div>

        <Section number="1" title="Upload Excel Spreadsheet">
          <UploadBox
            label="Drop your .xlsx file here or click to browse"
            accept=".xlsx,.xls"
            file={excelFile}
            onChange={handleExcelChange}
            inputRef={excelRef}
          />
          {previewData && previewData.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Preview — {previewData.length} record{previewData.length !== 1 ? 's' : ''} found
              </div>
              <div style={{ overf
