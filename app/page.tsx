'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [templateFiles, setTemplateFiles] = useState<File[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [previewData, setPreviewData] = useState<Record<string, string>[] | null>(null)
  const excelRef = useRef<HTMLInputElement>(null)
  const templateRef = useRef<HTMLInputElement>(null)

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
        padding: '24px 48px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: '#0d0f14',
      }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #c8a96e, #8b6914)',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 'bold', color: '#fff',
          flexShrink: 0,
        }}>B</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.04em', color: '#c8a96e' }}>
            BOP ABSTRACT
          </div>
          <div style={{ fontSize: 11, color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Lease Document Generator
          </div>
        </div>
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
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {Object.keys(previewData[0]).slice(0, 6).map(k => (
                        <th key={k} style={{
                          textAlign: 'left', padding: '6px 10px',
                          borderBottom: '1px solid #2a2a3a',
                          color: '#c8a96e', fontWeight: 500, whiteSpace: 'nowrap',
                        }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 3).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1a1a2a' }}>
                        {Object.values(row).slice(0, 6).map((v, j) => (
                          <td key={j} style={{ padding: '6px 10px', color: '#bbb', whiteSpace: 'nowrap' }}>
                            {String(v ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Section>

        <Section number="2" title="Upload Lease Template(s)">
          <UploadBox
            label="Drop your .docx template(s) here or click to browse"
            accept=".docx"
            multiple
            file={templateFiles.length > 0 ? templateFiles[0] : null}
            extraFiles={templateFiles.slice(1)}
            onChange={handleTemplateChange}
            inputRef={templateRef}
          />
          {templateFiles.length > 1 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Select template to use:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {templateFiles.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedTemplate(f.name)}
                    style={{
                      padding: '5px 12px', borderRadius: 4,
                      border: `1px solid ${selectedTemplate === f.name ? '#c8a96e' : '#333'}`,
                      background: selectedTemplate === f.name ? 'rgba(200,169,110,0.1)' : 'transparent',
                      color: selectedTemplate === f.name ? '#c8a96e' : '#888',
                      cursor: 'pointer', fontSize: 12,
                    }}
                  >{f.name}</button>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section number="3" title="Generate Documents">
          <button
            onClick={handleGenerate}
            disabled={status === 'loading'}
            style={{
              width: '100%', padding: '16px 32px',
              background: status === 'loading'
                ? '#2a2a3a'
                : 'linear-gradient(135deg, #c8a96e, #8b6914)',
              color: status === 'loading' ? '#666' : '#fff',
              border: 'none', borderRadius: 6, fontSize: 16,
              fontFamily: "'Georgia', serif", letterSpacing: '0.04em',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {status === 'loading' ? '⏳ Generating...' : '⬇ Generate & Download ZIP'}
          </button>

          {message && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 6,
              background: status === 'error' ? 'rgba(200,60,60,0.1)' : 'rgba(60,180,100,0.1)',
              border: `1px solid ${status === 'error' ? '#8b2020' : '#2a6640'}`,
              color: status === 'error' ? '#e07070' : '#70c090',
              fontSize: 14,
            }}>
              {message}
            </div>
          )}
        </Section>

        <div style={{ marginTop: 48, padding: 24, background: '#0d0f14', borderRadius: 8, border: '1px solid #1e1e2e' }}>
          <div style={{ fontSize: 11, color: '#c8a96e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Supported Merge Fields
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 24px' }}>
            {[
              '«Year»','«Lessor»','«Lessor_1»','«Lessor_2»','«Status»','«Address»',
              '«Township»','«County»','«State»','«Gross_Acres»','«Tax_ID»',
              '«Vesting_Lessor»','«Vesting_Date»','«Deed_Book»','«Deed_Page»',
              '«Insteument»','«Royalty_Spelled_out»','«Royalty_Number»',
              '«Bonus_Amount_Spelled_out»','«Bonus_Amount_Number»',
            ].map(tag => (
              <span key={tag} style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>{tag}</span>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#555' }}>
            Add a <em>State</em> column to your Excel file to populate «State» in the template.
          </div>
        </div>
      </div>
    </main>
  )
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(200,169,110,0.15)',
          border: '1px solid #c8a96e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: '#c8a96e', fontWeight: 600, flexShrink: 0,
        }}>{number}</div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 500, color: '#e8e0d0', letterSpacing: '0.01em' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function UploadBox({
  label, accept, file, extraFiles = [], onChange, inputRef, multiple = false
}: {
  label: string; accept: string; file: File | null;
  extraFiles?: File[]; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>; multiple?: boolean;
}) {
  const allFiles = file ? [file, ...extraFiles] : []
  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${file ? '#c8a96e' : '#2a2a3a'}`,
        borderRadius: 8, padding: '28px 24px', textAlign: 'center',
        cursor: 'pointer',
        background: file ? 'rgba(200,169,110,0.04)' : '#0d0f14',
        transition: 'all 0.2s',
      }}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={onChange} style={{ display: 'none' }} />
      {allFiles.length === 0 ? (
        <>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
          <div style={{ color: '#888', fontSize: 14 }}>{label}</div>
          <div style={{ color: '#555', fontSize: 12, marginTop: 4 }}>{accept.toUpperCase().replace(/\./g, '').replace(/,/g, ' / ')}</div>
        </>
      ) : (
        <div style={{ textAlign: 'left' }}>
          {allFiles.map(f => (
            <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <span style={{ color: '#c8a96e', fontSize: 14 }}>{f.name}</span>
              <span style={{ color: '#555', fontSize: 12 }}>({(f.size / 1024).toFixed(1)} KB)</span>
            </div>
          ))}
          <div style={{ color: '#555', fontSize: 12, marginTop: 8 }}>Click to change</div>
        </div>
      )}
    </div>
  )
}
