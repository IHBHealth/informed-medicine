# Informed Medicine - Health Guide

## What This Project Is
A consumer health information website built with Next.js. It provides easy-to-understand drug information (pulled from the FDA's openFDA API), health articles, lab test guides, supplement info, and Q&A content.

**Live site**: Deployed on Vercel
**Repo**: github.com/IHBHealth/informed-medicine

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Neon Postgres (project ID: `falling-brook-48456285`)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI components
- **AI**: Anthropic Claude API (content generation)
- **Images**: OpenAI API (image generation), Vercel Blob (storage)
- **Deployment**: Vercel with weekly cron job

## Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Push schema changes to Neon
npm run db:studio    # Open Drizzle Studio (DB browser)
```

## Project Structure
```
src/
  app/
    page.tsx                    # Homepage
    layout.tsx                  # Root layout with navigation
    drugs/
      page.tsx                  # Drug listing (A-Z, search, pagination)
      [slug]/page.tsx           # Drug detail page (8 structured sections)
    article/                    # Health articles
    advice/                     # Health advice
    lab-tests/                  # Lab test guides
    supplements/                # Supplement info
    qa/                         # Q&A section
    forum/                      # Community forum
    news/                       # Health news
    admin/                      # Admin panel (login, content management)
    api/
      admin/
        fda-sync/route.ts       # FDA drug sync (paginated, auto-timeout)
        fda-seed/route.ts       # Seed featured drugs
        articles/route.ts       # Article CRUD
        generate/route.ts       # AI content generation
        settings/route.ts       # Site settings
        upload/route.ts         # Image upload
      cron/
        fda-sync/route.ts       # Weekly auto-sync (letter ranges, auto-pagination)
        generate/route.ts       # Auto-generate content
      articles/route.ts         # Public article API
  lib/
    db.ts                       # Neon database connection
    schema.ts                   # Drizzle schema (fda_drugs, articles, topics, etc.)
    openfda.ts                  # openFDA API client (fetch, parse, structure)
    ai-generator.ts             # Claude AI content generation
    image-generator.ts          # OpenAI image generation
    types.ts                    # TypeScript types
    utils.ts                    # Utilities (slug, cn, etc.)
  components/                   # Reusable UI components
  data/                         # Static data files (featured drugs JSON, etc.)
```

## Database Schema (Neon)
Main tables:
- **fda_drugs** — Drug entries with structured FDA data
  - `slug`, `generic_name`, `display_name`, `brand_names` (text[])
  - `drug_class`, `prescription_required`, `is_featured`
  - `curated_data` (JSONB) — Structured fields: description, uses, dosage, sideEffects, warnings, interactions, pregnancy, storage
  - `description` (text) — Short summary for listing cards (max 500 chars)
  - `set_id` — FDA label set ID for API lookups
- **articles** — Health articles (title, slug, content, topic, images)
- **topics** — Content categories
- **settings** — Site configuration

## FDA Drug Data Flow
1. `openFDA API` → `fda-sync/route.ts` fetches labels per letter (A-Z)
2. `openfda.ts` parses labels → detects OTC vs Rx → extracts structured fields
3. Stores in `fda_drugs` table with `curated_data` JSONB
4. Drug detail page reads `curated_data` → renders 8 info cards
5. 3-tier fallback: curated_data → live API call → static JSON
6. Weekly cron auto-syncs new drugs (Sunday 3am)

## FDA Sync API
```bash
# Sync a single letter (with pagination)
curl -X POST "https://site.vercel.app/api/admin/fda-sync?letter=A&skip=0&limit=100" \
  -H "Authorization: Bearer $CRON_SECRET"

# Full sync with letter ranges (auto-paginates each letter)
curl -X POST "https://site.vercel.app/api/cron/fda-sync?from=A&to=E" \
  -H "Authorization: Bearer $CRON_SECRET"
# Then: ?from=F&to=J, ?from=K&to=O, ?from=P&to=T, ?from=U&to=Z
```

## Environment Variables
```
DATABASE_URL          # Neon Postgres connection string
ANTHROPIC_API_KEY     # Claude API for content generation
OPENAI_API_KEY        # Image generation (optional)
BLOB_READ_WRITE_TOKEN # Vercel Blob storage
ADMIN_PASSWORD        # Admin panel login
ADMIN_API_KEY         # API auth for agents
CRON_SECRET           # Vercel cron job auth
```

## Important Notes
- 10 drugs are hand-curated (`is_featured = true`) — sync skips these
- The openFDA count API returns max 1,000 unique drug names per letter
- Sync route has auto-timeout safety (stops at 270s, returns resume point)
- Drug detail pages use ISR with 24-hour revalidation
- Always update BOTH `curated_data` AND `description` columns when modifying drugs
