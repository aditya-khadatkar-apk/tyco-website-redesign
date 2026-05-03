# Project Mission: Tyco India Redesign
**Goal:** Transform the legacy industrial site (tyco-india.com) into a modern, high-performance business site using a Supabase-only backend.

## 🛠 Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with custom SMTP (Resend)
- **Deployment:** Vercel (recommended for Vite + SEO)
- **Security:** Google reCAPTCHA v3 + Supabase RLS

## 🏛 Database Schema

### 1. `profiles` (Auth & Roles)
- `id`: uuid (references auth.users)
- `email`: text
- `role`: text (Options: 'super-admin', 'admin', 'user')
- *Constraint:* Only 'super-admin' can promote other users to 'admin'.

### 2. `products` (Core Catalog)
- `id`: uuid (primary key)
- `name`: text
- `slug`: text (Unique, SEO-friendly)
- `description`: text (HTML or Markdown allowed)
- `image_url`: text (Supabase Storage link)
- `specs`: jsonb (For technical parameters like Power, Capacity, etc.)
- `created_at`: timestamp

## 🔐 Security & RLS Policies
- **Public Access:** `SELECT` permission on `products` table for everyone.
- **Admin Access:** `INSERT`, `UPDATE`, `DELETE` on `products` only if `requesting_user.role` is 'admin' or 'super-admin'.
- **Admin Management:** Only `super-admin` can `UPDATE` the `role` column in the `profiles` table.

## 🚀 Execution Roadmap

### Phase 1: Infrastructure & SEO Setup
- Initialize Vite with Tailwind.
- Configure `react-router-dom` for clean URLs.
- Setup `react-helmet-async` for dynamic Meta Titles/Descriptions.
- Configure `vite-plugin-prerender` for static indexing.

### Phase 2: The Admin Portal (`/admin`)
- Create a secure login page.
- Build a CRUD dashboard for the `products` table.
- Implement image upload logic using Supabase Storage buckets.
- Ensure the Admin UI is exclusive and hidden from public navigation.

### Phase 3: Public UI Migration
- Migrate content from `tyco-india.com/company-profile`.
- Create a modern, responsive product gallery using CSS Grid.
- Implement a "Contact Us" form with a dedicated Supabase Edge Function.

### Phase 4: Communications & AI
- **Email:** Connect Resend SMTP to Supabase for production-ready notifications.
- **Bot:** (Planned) Integrate Gemini API with pgvector for product-specific Q&A.

## 🤖 Agent Instructions
1. **Preserve Content:** Always keep the original text and branding from Tyco India.
2. **SEO First:** Every new page component must include a `<Helmet>` tag for metadata.
3. **No Java:** Do not suggest Spring Boot or Java solutions. All backend logic must reside in Supabase (Postgres, RLS, or Edge Functions).
4. **Resend Integration:** Use `supabase/functions` for any mail-sending logic to avoid default rate limits.