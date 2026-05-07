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
    }
