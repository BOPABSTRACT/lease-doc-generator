export default function HelpPage() {
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
        justifyContent: 'space-between',
        background: '#0d0f14',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="https://i.imgur.com/szjzoxt.png" alt="BOP Acquisition Logo"
            style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.04em', color: '#c8a96e' }}>BOP ACQUISITION</div>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Lease Generator</div>
          </div>
        </div>
        <a href="/" style={{
          color: '#c8a96e', fontSize: 13, textDecoration: 'none',
          border: '1px solid #c8a96e', padding: '6px 14px', borderRadius: 4,
        }}>← Back to App</a>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 32px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, color: '#e8e0d0', marginBottom: 8 }}>User Guide</h1>
        <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
          This tool automatically fills in oil &amp; gas lease documents using data from an Excel spreadsheet.
          Instead of manually typing lessor names, acreage, and legal descriptions into each lease,
          the app does it for you — generating one completed Word document per row in your spreadsheet.
        </p>

        {[
          {
            n: '1', title: 'Open the App & Log In',
            body: 'Go to the app URL in any web browser. Enter your password at the prompt and press Enter to access the app.',
            note: null,
          },
          {
            n: '2', title: 'Upload Your Excel Spreadsheet',
            body: 'Click the first upload box and select your .xlsx file. A preview table will appear confirming your data loaded correctly. Each row in the spreadsheet becomes one lease document.',
            note: 'The spreadsheet must use the standard BOP column format — see the column list below.',
          },
          {
            n: '3', title: 'Upload Your Lease Template',
            body: 'Click the second upload box and select the .docx lease template you want to use. You can upload multiple templates — if you do, click the correct one to select it before generating.',
            note: 'Keep your templates saved on your computer for easy re-upload.',
          },
          {
            n: '4', title: 'Generate & Download',
            body: 'Click ⬇ Generate & Download ZIP. The app merges each row into the template and packages all completed documents into a ZIP file that downloads automatically to your computer.',
            note: 'Files are named by record number and lessor — e.g. 001_Jon_Smith.docx, 002_Peter_Smith.docx',
          },
          {
            n: '5', title: 'Open & Review the Documents',
            body: 'Extract the ZIP file and open each Word document to review. All fields will be filled in with data from your spreadsheet. Documents are ready to print or send for signature.',
            note: null,
          },
        ].map(step => (
          <div key={step.n} style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(200,169,110,0.12)', border: '1px solid #c8a96e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#c8a96e', fontWeight: 600, flexShrink: 0, marginTop: 2,
            }}>{step.n}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#e8e0d0', marginBottom: 6 }}>{step.title}</div>
              <div style={{ fontSize: 14, color: '#888', lineHeight: 1.7 }}>{step.body}</div>
              {step.note && (
                <div style={{
                  marginTop: 8, padding: '8px 12px',
                  background: 'rgba(200,169,110,0.06)', borderLeft: '2px solid #c8a96e',
                  fontSize: 13, color: '#aaa', lineHeight: 1.6,
                }}>→ {step.note}</div>
              )}
            </div>
          </div>
        ))}

        <hr style={{ border: 'none', borderTop: '1px solid #1e1e2e', margin: '36px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
          <div style={{ background: '#0d0f14', border: '1px solid #1e1e2e', borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#c8a96e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Required Excel Columns</div>
            {[
              'Year',
              'Lessor (full combined name)',
              'Lessor 1 (first lessor)',
              'Lessor 2 (second lessor)',
              'Status (e.g. Husband and Wife)',
              'Address',
              'Township',
              'County',
              'State (e.g. PA, WV)',
              'Gross Acres',
              'Tax ID',
              'Vesting Lessor',
              'Vesting Date',
              'Deed Book',
              'Deed Page',
              'Instrument',
              'Royalty Spelled out',
              'Royalty Number',
              'Bonus Amount Spelled out',
              'Bonus Amount Number',
            ].map(col => (
              <div key={col} style={{ fontSize: 13, color: '#888', padding: '4px 0', borderBottom: '1px solid #1a1a2a' }}>{col}</div>
            ))}
          </div>
          <div style={{ background: '#0d0f14', border: '1px solid #1e1e2e', borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#c8a96e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Available Templates</div>
            {[
              'NEPA Lease',
              'PA Allegheny / Wash Lease',
              'PA Allegheny / Wash Lease (Flat Rate)',
              'PA EQT Artemis Lease',
              'PA EQT Artemis Lease (Non Surface)',
              'PA Long Form Lease',
              'Short Form Lease',
              'Short Form Lease (Flat Rate)',
              'WV Long Form Lease',
            ].map(t => (
              <div key={t} style={{ fontSize: 13, color: '#888', padding: '4px 0', borderBottom: '1px solid #1a1a2a' }}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{ background: '#0d0f14', border: '1px solid #2a3a2a', borderRadius: 8, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: '#70c090', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Tips &amp; Common Issues</div>
          {[
            'Make sure your Excel file uses the exact column names listed above — spelling and capitalization matter.',
            'Each row in your spreadsheet = one lease document in the output ZIP.',
            'If a field is blank in Excel, it will appear blank in the lease — review all rows before generating.',
            'If a merge tag appears unformatted in output (e.g. «Lessor_1» instead of a name), the tag in the Word template may be corrupted — contact your administrator.',
            'The app works in any modern browser — Chrome, Edge, Firefox, or Safari.',
            'For support or access issues contact your BOP Acquisition administrator.',
          ].map((tip, i) => (
            <div key={i} style={{ fontSize: 13, color: '#888', padding: '5px 0 5px 16px', position: 'relative', lineHeight: 1.6 }}>
              <span style={{ position: 'absolute', left: 0, color: '#70c090' }}>→</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
