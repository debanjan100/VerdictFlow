# VerdictFlow

VerdictFlow is a production-ready, AI-powered Court Judgment Analysis and Action Plan Management System designed for government use in India. It transforms dense, unstructured court judgment PDFs into verified, actionable government compliance plans using a 4-stage pipeline powered by Google Gemini 1.5 Pro.

## Features

- **PDF Upload & AI Extraction**: Instantly parse complex court rulings.
- **AI Action Plan Generation**: Automatically translate judgments into step-by-step compliance, appeal, and execution plans.
- **Case Lifecycle Tracking**: Monitor the status of judgments and track critical timelines and deadlines.
- **Human Verification**: Built-in workflows for legal professionals to review and approve AI-generated insights.
- **Department Breakdown**: Visualize compliance action assignments across different government departments.
- **Smooth Animations**: A modern UI with smooth page transitions and Framer Motion animations.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **Database**: Supabase (PostgreSQL + Storage)
- **AI Model**: Google Gemini API (`@google/genai`)
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+ and npm
- A Supabase Project
- A Google Gemini API Key

## Getting Started

### 1. Database Setup

You need to initialize the database tables in your Supabase project.
1. Open your Supabase Dashboard and go to the SQL Editor.
2. Copy the contents of `supabase/schema.sql`.
3. Paste and run the SQL script to create all necessary tables, policies, and storage buckets.

### 2. Environment Variables

Create a `.env.local` file in the root directory (you can copy `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Fill in your actual API keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install Dependencies

Install the required npm packages:

```bash
npm install
```

### 4. Run the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You will be automatically redirected to the login page.

## Project Structure

- `app/(auth)`: Contains the login page and authentication layout.
- `app/(dashboard)`: Contains the main authenticated dashboard layout, case overview, and PDF upload functionalities.
- `app/api`: Next.js Route Handlers for the Gemini extraction and action plan generation APIs.
- `components/ui`: Reusable UI components from `shadcn/ui`.
- `lib/gemini`: Gemini client initialization and prompt templates.
- `lib/supabase`: Supabase clients for browser, server components, and middleware.
- `supabase/schema.sql`: The database schema definition.

## Design

VerdictFlow features a modern, premium design with a "Government-grade legal intelligence" aesthetic. The UI uses professional blue primary colors combined with subtle dark-mode-ready backgrounds and crisp micro-animations (powered by Framer Motion).

## Connect With Us

- **GitHub**: [debanjan100](https://github.com/debanjan100)
- **LinkedIn**: [Debanjan Ghorui](https://www.linkedin.com/in/debanjanghorui5567/)
