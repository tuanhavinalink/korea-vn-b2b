# Korea-Vietnam B2B Trade Platform

Full-stack B2B platform connecting Korean enterprises with Vietnamese business partners.

---

## Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database + Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

---

## Deploy Guide (Step by Step)

### Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `korea-vn-b2b`) and set a strong database password
3. Wait ~2 minutes for the project to be ready
4. Go to **SQL Editor** → **New Query** → paste the entire contents of `supabase/schema.sql` → **Run**
5. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

#### Configure Supabase Auth
- Go to **Authentication → Settings**
- Set **Site URL** to your Vercel domain (e.g. `https://your-app.vercel.app`)
- Add **Redirect URLs**: `https://your-app.vercel.app/**`
- If you want email confirmation: leave default. For quick testing: disable email confirmation under **Auth → Settings → Email**

#### Create Admin Account
- Go to **Authentication → Users → Add user**
- Enter admin email + password
- Copy the user `id`
- Go to **SQL Editor** and run:
  ```sql
  INSERT INTO profiles (id, role) VALUES ('PASTE_USER_ID_HERE', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
  ```

---

### Step 2 — Deploy to Vercel

1. Push this project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/korea-vn-b2b.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
3. In **Environment Variables**, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY = eyJ...
   ```
4. Click **Deploy** — Vercel will build and deploy automatically

---

### Step 3 — Connect Your Custom Domain

1. In Vercel project → **Settings → Domains** → Add your domain
2. Go to your domain registrar (GoDaddy, Namecheap, etc.) and add the DNS records Vercel shows you:
   - Usually an `A` record pointing to `76.76.21.21`
   - Or a `CNAME` record pointing to `cname.vercel-dns.com`
3. Wait 5–30 minutes for DNS propagation
4. Update Supabase **Site URL** and **Redirect URLs** with your custom domain

---

## User Roles

| Role | How to Create | What They Can Do |
|------|--------------|-----------------|
| **Admin** | Manually in Supabase Auth + SQL | Full access: manage companies, events, view all contacts |
| **Korean Company** | Admin creates via Add Company form | Login, see who loved their company/products |
| **Vietnamese Buyer** | Self-register at `/register` | Browse, love companies/products, join zoom events |

---

## Features

### Homepage
- Grid of Korean company logos with name + sector
- Upcoming ZOOM events banner
- Click company → showroom page

### Company Showroom (`/company/[id]`)
- YouTube intro video (auto-embed from any YouTube URL)
- Catalog link (Google Drive or any URL)
- Product grid with images + descriptions
- Love/Favorite button (VN users)

### Vietnamese Member Dashboard (`/member/dashboard`)
- Saved/loved companies list
- Saved/loved products list
- ZOOM events they're interested in + quick links

### Korean Company Dashboard (`/korean/dashboard`)
- Count of VN buyers interested (no personal details shown)
- Product interest summary (how many loves per product)

### Admin Panel (`/admin`)
- Dashboard with stats + recent activity
- **Companies**: add, edit, toggle visibility, view favorites
- **Events**: create zoom events, set zoom + zalo links, publish/draft
- **Members**: full contact table with activity stats (favorites, events)

### ZOOM Events (`/events`)
- List upcoming meetings
- "JOIN MEETING" button (VN users express interest)
- Zalo group link for each event
- Past events shown separately

---

## Local Development

```bash
# Clone and install
cd korea-vn-b2b
npm install

# Copy env
cp .env.example .env.local
# Fill in your Supabase credentials

# Run dev server
npm run dev
# Open http://localhost:3000
```

---

## Adding Korean Companies (Admin workflow)

1. Login as admin → `/admin/companies` → **Add Company**
2. Fill in: name, sector, logo URL, YouTube video URL, catalog URL, description
3. Enter Korean rep login email + temporary password
4. Add products with images and descriptions
5. The Korean rep gets an email to login at `/login`

---

## Updating Supabase Storage (for logo/image uploads)

If you want file uploads instead of external URLs:
1. Go to Supabase → **Storage** → Create bucket `images` (public)
2. Upload images and copy the public URL
3. Paste URL into logo/image fields in admin

---

## Support

For issues with deployment, check:
- Supabase logs: **Project → Logs → API**
- Vercel logs: **Project → Functions → Logs**
