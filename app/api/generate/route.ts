import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import PizZip from 'pizzip'
import JSZip from 'jszip'

const COLUMN_MAP: Record<string, string> = {
  'Year': 'Year',
  'Lessor 1': 'Lessor_1',
  'Lessor 2': 'Lessor_2',
  'Status': 'Status',
  'Address': 'Address',
  'Township': 'Township',
  'County': 'County',
  'State': 'State',
  'Gross Acres': 'Gross_Acres',
  'Tax ID': 'Tax_ID',
  'Vesting Lessor': 'Vesting_Lessor',
  'Vesting Date': 'Vesting_Date',
  'Deed Book': 'Deed_Book',
  'Deed Page': 'Deed_Page',
  'Insteument': 'Insteument',
  'Royalty (Spelled out)': 'Royalty_Spelled_out',
  'Royalty (Number)': 'Royalty_Number',
  'Bonus Amount (Spelled out)': 'Bonus_Amount_Spelled_out',
  'Bonus Amount (Number)': 'Bonus_Amount_Number',
}

function buildMergeData(row: Record<string, unknown>): Record<string, string> {
  const data: Record<string, string> = {}
  for (const [col, tag] of Object.entries(COLUMN_MAP)) {
    data[tag] = String(row[col] ?? '')
  }
  return data
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-. ]/g, '_').trim()
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateDocx(templateBuffer: Buffer, mergeData: Record<string, string>): Buffer {
  const zip = new PizZip(templateBuffer)
  const xmlFiles = [
    'word/document.xml', 'word/header1.xml', 'word/footer1.xml',
    'word/header2.xml', 'word/footer2.xml', 'word/header3.xml', 'word/footer3.xml'
  ]
  for (const xmlFile of xmlFiles) {
    try {
      let xml = zip.file(xmlFile)?.asText()
      if (!xml) continue
      for (const [tag, value] of Object.entries(mergeData)) {
        const escapedValue = escapeXml(value)
        xml = xml.split(`\u00ab${tag}\u00bb`).join(escapedValue)
        xml = xml.split(`&#xAB;${tag}&#xBB;`).join(escapedValue)
        xml = xml.split(`&#171;${tag}&#187;`).join(escapedValue)
      }
      zip.file(xmlFile, xml)
    } catch {
      // File doesn't exist, skip
    }
  }
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer
}

async function convertToPdf(docxBuffer: Buffer, filename: string): Promise<Buffer | null> {
  const apiKey = process.env.CLOUDCONVERT_API_KEY
  if (!apiKey) return null

  try {
    // Step 1: Create a job with upload + convert + export tasks
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'upload-file': {
            operation: 'import/upload',
          },
          'convert-file': {
            operation: 'convert',
            input: 'upload-file',
            input_format: 'docx',
            output_format: 'pdf',
          },
          'export-file': {
            operation: 'export/url',
            input: 'convert-file',
          },
        },
      }),
    })

    const job = await jobRes.json()
    const uploadTask = job.data.tasks.find((t: {name: string}) => t.name === 'upload-file')

    // Step 2: Upload the DOCX
    const uploadUrl = uploadTask.result.form.url
    const uploadParams = uploadTask.result.form.parameters
    const formData = new FormData()
    for (const [key, value] of Object.entries(uploadParams)) {
      formData.append(key, value as string)
    }
   11:18:07.992 Running build in Washington, D.C., USA (East) – iad1
11:18:07.993 Build machine configuration: 4 cores, 8 GB
11:18:08.003 Cloning github.com/BOPABSTRACT/lease-doc-generator (Branch: main, Commit: e6d9ba8)
11:18:08.004 Skipping build cache, deployment was triggered without cache.
11:18:08.444 Cloning completed: 441.000ms
11:18:08.695 Running "vercel build"
11:18:09.352 Vercel CLI 51.6.1
11:18:09.585 Installing dependencies...
11:18:16.110 npm warn deprecated multer@1.4.5-lts.2: Multer 1.x is impacted by a number of vulnerabilities, which have been patched in 2.x. You should upgrade to the latest 2.x version.
11:18:19.824 npm warn deprecated next@14.2.5: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
11:18:19.862 
11:18:19.862 added 89 packages in 10s
11:18:19.862 
11:18:19.863 9 packages are looking for funding
11:18:19.863   run `npm fund` for details
11:18:19.910 Detected Next.js version: 14.2.5
11:18:19.914 Running "npm run build"
11:18:20.013 
11:18:20.013 > lease-doc-generator@0.1.0 build
11:18:20.013 > next build
11:18:20.013 
11:18:20.493 Attention: Next.js now collects completely anonymous telemetry regarding usage.
11:18:20.493 This information is used to shape Next.js' roadmap and prioritize features.
11:18:20.494 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
11:18:20.494 https://nextjs.org/telemetry
11:18:20.494 
11:18:20.542   ▲ Next.js 14.2.5
11:18:20.542 
11:18:20.557    Creating an optimized production build ...
11:18:27.713  ✓ Compiled successfully
11:18:27.714    Linting and checking validity of types ...
11:18:29.533 Failed to compile.
11:18:29.533 
11:18:29.534 ./app/api/generate/route.ts:114:39
11:18:29.534 Type error: Type 'Buffer<ArrayBufferLike>' is not assignable to type 'BlobPart'.
11:18:29.534   Type 'Buffer<ArrayBufferLike>' is not assignable to type 'ArrayBufferView<ArrayBuffer>'.
11:18:29.534     Types of property 'buffer' are incompatible.
11:18:29.534       Type 'ArrayBufferLike' is not assignable to type 'ArrayBuffer'.
11:18:29.534         Type 'SharedArrayBuffer' is missing the following properties from type 'ArrayBuffer': resizable, resize, detached, transfer, transferToFixedLength
11:18:29.534 
11:18:29.534   112 |       formData.append(key, value as string)
11:18:29.534   113 |     }
11:18:29.535 > 114 |     formData.append('file', new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), filename)
11:18:29.535       |                                       ^
11:18:29.535   115 |     await fetch(uploadUrl, { method: 'POST', body: formData })
11:18:29.535   116 |
11:18:29.535   117 |     // Step 3: Wait for job to complete
11:18:29.590 Error: Command "npm run build" exited with 1

    // Step 3: Wait for job to complete
    let pdfUrl: string | null = null
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000))
      const statusRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${job.data.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
      const status = await statusRes.json()
      const exportTask = status.data.tasks.find((t: {name: string}) => t.name === 'export-file')
      if (exportTask?.status === 'finished') {
        pdfUrl = exportTask.result.files[0].url
        break
      }
      if (status.data.status === 'error') break
    }

    if (!pdfUrl) return null

    // Step 4: Download the PDF
    const pdfRes = await fetch(pdfUrl)
    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer())
    return pdfBuffer

  } catch (err) {
    console.error('CloudConvert error:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const excelFile = formData.get('excel') as File
    const templateFiles = formData.getAll('templates') as File[]

    if (!excelFile || templateFiles.length === 0) {
      return NextResponse.json({ error: 'Missing excel or template files' }, { status: 400 })
    }

    const excelBuffer = Buffer.from(await excelFile.arrayBuffer())
    const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[]

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in spreadsheet' }, { status: 400 })
    }

    const templateFile = templateFiles[0]
    const templateBuffer = Buffer.from(await templateFile.arrayBuffer())
    const outputZip = new JSZip()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const mergeData = buildMergeData(row)
      const lessor1 = sanitizeFilename(mergeData['Lessor_1'] || `Record_${i + 1}`)
      const baseName = `${String(i + 1).padStart(3, '0')}_${lessor1}`

      let docxBuffer: Buffer
      try {
        docxBuffer = generateDocx(templateBuffer, mergeData)
      } catch (err) {
        return NextResponse.json(
          { error: `Failed to merge row ${i + 1} (${mergeData['Lessor_1']}): ${String(err)}` },
          { status: 500 }
        )
      }

      outputZip.file(`docx/${baseName}.docx`, docxBuffer)

      const pdfBuffer = await convertToPdf(docxBuffer, `${baseName}.docx`)
      if (pdfBuffer) {
        outputZip.file(`pdf/${baseName}.pdf`, pdfBuffer)
      } else {
        outputZip.file(
          `pdf/${baseName}_NOTE.txt`,
          'PDF conversion unavailable. Please open the DOCX file and save as PDF manually.'
        )
      }
    }

    const zipArrayBuffer: ArrayBuffer = await outputZip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })

    return new NextResponse(zipArrayBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="lease-documents.zip"`,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
