import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import PizZip from 'pizzip'
import JSZip from 'jszip'

const COLUMN_MAP: Record<string, string> = {
  'Year': 'Year',
  'Lessor': 'Lessor',
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
  'Royalty Spelled out': 'Royalty_Spelled_out',
  'Royalty Number': 'Royalty_Number',
  'Bonus Amount Spelled out': 'Bonus_Amount_Spelled_out',
  'Bonus Amount Number': 'Bonus_Amount_Number',
  'File Type': 'File_Type',
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

      outputZip.file(`${baseName}.docx`, docxBuffer)
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
