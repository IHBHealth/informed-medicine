# InformedMedicine - Setup & Deploy Guide

## Quick Start (Local Development)

### Step 1: Install Dependencies
Open a terminal in this folder and run:
```bash
npm install
```

### Step 2: Set Up Environment Variables
Copy the example env file and fill in your values:
```bash
cp .env.example .env.local
```

**Required for the AI Newsroom (admin panel, auto-generation):**
```
DATABASE_URL=           # Neon Postgres connection string
ANTHROPIC_API_KEY=      # Claude API key for article generation
ADMIN_PASSWORD=         # Password for the admin panel
ADMIN_API_KEY=          # API key for programmatic access (agents)
CRON_SECRET=            # Secret for Vercel cron authentication
```

**Optional:**
```
OPENAI_API_KEY=         # DALL-E for image generation
BLOB_READ_WRITE_TOKEN=  # Vercel Blob for image storage
```

> **Note:** The static content pages (drugs, lab tests, supplements, Q&A, forum) work without any environment variables. The newsroom features require the database and API keys.

### Step 3: Set Up the Database (Neon Postgres)
1. Go to https://neon.tech and create a free account
2. Create a new project and copy the connection string
3. Paste it as `DATABASE_URL` in `.env.local`
4. Run database migrations:
```bash
npx drizzle-kit push
```

### Step 4: Run Locally
```bash
npm run dev
```
Open http://localhost:3000 to see your site.
Open http://localhost:3000/admin to access the admin panel.

---

## Deploy to Vercel

### Option A: Through Vercel Website (easiest)
1. Push this folder to a GitHub repository
2. Go to https://vercel.com and sign in with GitHub
3. Click "Add New Project" → Import your repo
4. Add your environment variables in the Vercel project settings
5. Vercel auto-detects Next.js — click "Deploy"
6. Done! Your site is live with cron jobs running automatically.

### Option B: Using Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the prompts, then add env vars via `vercel env add`.

### Custom Domain
1. In Vercel dashboard → your project → Settings → Domains
2. Add your domain (e.g., informedmedicine.com)
3. Update DNS records as Vercel instructs
4. Update `SITE_URL` in `src/lib/utils.ts` to your actual domain

---

## What's Included (67 files)

### Public Content Pages (SSG — Static Site Generation)
- **Homepage** — hero section, trending topics, featured articles, Q&A sidebar
- **Drug Database** — listing + 10 drug detail pages with full medical info
- **Lab Tests Guide** — listing + 10 lab test detail pages with normal ranges
- **Supplements Guide** — listing + 10 supplement detail pages with dosage/safety
- **News** — article listing with ISR (pulls from database + static fallback)
- **Advice** — health advice article listing
- **Q&A** — community health questions
- **Forum** — community health discussions
- **Article Detail** — database-driven article pages with full SEO
- **404 page**

### SEO Infrastructure
- Dynamic `sitemap.xml` (auto-generated from all content + database articles)
- `robots.txt` allowing all crawlers including AI bots
- JSON-LD structured data per page type (Drug, MedicalTest, DietarySupplement, Article, FAQPage, MedicalWebPage, BreadcrumbList, Organization, WebSite)
- Per-page `generateMetadata()` (title, description, OG tags, Twitter cards)
- `generateStaticParams()` for all detail pages (pre-rendered at build time)
- Breadcrumb navigation with schema markup
- Canonical URLs
- Semantic HTML (`<article>`, `<section>`, `<nav>`)

### GEO Optimization (AI Discoverability)
- `llms.txt` file for AI crawler guidance
- FAQ sections with FAQPage schema (directly cited by AI overviews)
- Definition-style opening paragraphs (optimized for LLM extraction)
- Clean semantic HTML without JavaScript dependency
- AI crawlers explicitly allowed: GPTBot, ClaudeBot, PerplexityBot, Google-Extended

### AI Newsroom (Admin Panel + Auto-Generation)
- **Admin Dashboard** (`/admin`) — article counts, generation stats, cost tracking
- **Topic Management** (`/admin/topics`) — create topic beats the AI writes about
- **Settings** (`/admin/settings`) — articles per day, auto-publish, image generation, AI model selection
- **Article Management** (`/admin/articles`) — list, filter, edit, publish articles
- **Article Editor** (`/admin/articles/new` and `/admin/articles/[id]`) — manual creation with image upload
- **Generation Logs** (`/admin/logs`) — cost breakdown, token usage, error tracking
- **Cron Job** — runs every 6 hours, generates articles based on your settings
- **Agent API** — external agents can POST articles via Bearer token auth

### API Routes (13 endpoints)
- Public: `GET /api/articles`, `GET /api/articles/[slug]`
- Admin: CRUD for topics, settings, articles + manual generation trigger + image upload + stats
- Cron: `POST /api/cron/generate` (Vercel cron, rate-limited)

### Data Files
- 10 drugs, 10 lab tests, 10 supplements, 6 articles, 5 questions, 4 forum posts
- All stored as static JSON in `src/data/`

---

## AI Newsroom: How It Works

### Automatic Article Generation
1. Set up topic beats in `/admin/topics` (e.g., "Heart Health Research", "Nutrition News")
2. Configure articles per day in `/admin/settings` (controls cost)
3. The Vercel cron job runs every 6 hours and generates articles using Claude
4. Articles are saved as drafts (or auto-published if you enable it)
5. Review and publish from `/admin/articles`

### Manual Article Creation
1. Go to `/admin/articles/new`
2. Write or paste content (accepts HTML)
3. Upload a featured image
4. Set SEO title and description (auto-generates if left blank)
5. Save as draft or publish immediately

### Agent API (for AI agents to create content)
```bash
curl -X POST https://your-site.com/api/admin/articles \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Article Title",
    "content": "<p>HTML content here</p>",
    "category": "heart-health",
    "section": "news",
    "status": "draft"
  }'
```

### Cost Control
- **articlesPerDay** is the primary cost lever (1 article ≈ $0.15/day with Claude Sonnet)
- Toggle image generation on/off (images are the most expensive part)
- Choose between Claude Sonnet (cheaper) and Opus (higher quality)
- Monitor costs in the dashboard and generation logs

---

## Next Steps

1. **Expand content:** Add more drugs, lab tests, and supplements to the JSON data files
2. **Add programmatic pages:** Drug comparisons ("vs" pages), interaction pages, symptom checker
3. **Set up topic beats:** Create 5-10 topic beats in the admin panel for diverse content
4. **Add analytics:** Vercel Analytics or Google Analytics
5. **Submit to search engines:** Submit your sitemap to Google Search Console and Bing Webmaster Tools
6. **Monitor AI citations:** Check if your content appears in ChatGPT, Perplexity, and Google AI Overviews
