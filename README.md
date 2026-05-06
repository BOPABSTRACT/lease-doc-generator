# BOP Abstract — Lease Document Generator

A web app that mail-merges Excel spreadsheet data into oil & gas lease Word templates, outputting `.docx` and `.pdf` files for each record.

## How It Works

1. Upload an Excel spreadsheet (`.xlsx`) with lease data
2. Upload one or more Word lease templates (`.docx`) containing `«merge_tags»`
3. Click **Generate** — the app produces one DOCX + one PDF per row
4. Download all files as a single ZIP

## Supported Merge Tags

| Template Tag | Excel Column |
|---|---|
| `«Year»` | Year |
| `«Lessor_1»` | Lessor 1 |
| `«Lessor_2»` | Lessor 2 |
| `«Status»` | Status |
| `«Address»` | Address |
| `«Township»` | Township |
| `«County»` | County |
| `«State»` | State |
| `«Gross_Acres»` | Gross Acres |
| `«Tax_ID»` | Tax ID |
| `«Vesting_Lessor»` | Vesting Lessor |
| `«Vesting_Date»` | Vesting Date |
| `«Deed_Book»` | Deed Book |
| `«Deed_Page»` | Deed Page |
| `«Insteument»` | Insteument |
| `«Royalty_Spelled_out»` | Royalty (Spelled out) |
| `«Royalty_Number»` | Royalty (Number) |
| `«Bonus_Amount_Spelled_out»` | Bonus Amount (Spelled out) |
| `«Bonus_Amount_Number»` | Bonus Amount (Number) |

## Tech Stack

- **Next.js 14** (App Router)
- **docxtemplater** — Word mail merge
- **xlsx** — Excel parsing
- **jszip** — ZIP packaging
- **libreoffice-convert** — DOCX → PDF (requires LibreOffice on server)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployed on [Vercel](https://vercel.com) — push to `main` branch to auto-deploy.

> **Note on PDF generation**: PDF conversion requires LibreOffice installed on the server. Vercel's serverless environment does not include LibreOffice by default. DOCX files will always be generated. For PDF support, consider a Docker-based deployment or a dedicated PDF conversion service.
