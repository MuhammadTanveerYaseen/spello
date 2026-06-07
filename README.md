# Spello Cafe — Construction Expenses

Professional mobile expense management for Spello Cafe during the construction phase. Built with Next.js and MongoDB Atlas.

## Features

- **Secure access** — Protected by security key
- **Investor funding** — Track contributions, returns, and available project balance
- **Expense ledger** — Record construction payments with category, vendor, date, and invoice
- **Construction categories** — Civil, electrical, plumbing, labor, materials, and more
- **Filters & full history** — Search, filter by category and date range
- **Audit log** — Every action is tracked
- **Account settings** — Cafe name, owner details, contact info

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure MongoDB Atlas** — copy `.env.local.example` to `.env.local`

3. **Run the app**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Login

Security key: `spello-shafiq`

## Tech Stack

- Next.js 16 (App Router)
- MongoDB Atlas + Mongoose
- Tailwind CSS
- JWT session cookies
