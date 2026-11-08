# 🛡️ Sahiraah — Disaster Recovery Guide

> **Keep this file safe.** If your Supabase account is ever locked, paused, or deleted,
> follow this guide to restore everything in under 30 minutes.

---

## 📋 Current Live Project

| Item | Value |
|------|-------|
| **Project ID** | `kqfonbpsafnsldclnvul` |
| **Project URL** | `https://kqfonbpsafnsldclnvul.supabase.co` |
| **Organization** | Sahiraah Project (GhosThUnTer2965's Account) |
| **Region** | ap-south-1 (Mumbai) |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/kqfonbpsafnsldclnvul |

---

## 🔑 Account Credentials

> [!CAUTION]
> Store these in a password manager (e.g., Bitwarden, 1Password). Do NOT commit to Git.

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Supabase owner | *(your Supabase login email)* | *(your Supabase password)* | Owner |
| App Admin | `admin@sahiraah.com` | `AdminPassword123!` | Admin + Expert |
| Expert 1 | `priya@sahiraah.com` | `Expert123!` | Expert |
| Expert 2 | `amit@sahiraah.com` | `Expert123!` | Expert |
| Expert 3 | `sneha@sahiraah.com` | `Expert123!` | Expert |
| Demo Student | `student@sahiraah.com` | `StudentPassword123!` | Student |

---

## 🗂️ Key Files (Your "Source of Truth")

All recovery scripts live in `supabase/`:

```
supabase/
├── complete_database_setup.sql   ← Full schema + static seed data (run FIRST)
├── seed_demo_data.sql            ← Demo student data (run after setup)
├── seed_all_experts.sql          ← Expert auth accounts (run after setup)
├── scripts/
│   └── backup_data.js            ← Automated backup exporter
└── backups/
    └── backup_YYYY-MM-DD.sql     ← Dated data snapshots (run script to generate)
```

---

## 🚨 Emergency Recovery Steps

### Scenario A: Supabase Project Paused (Free Tier)

Free-tier projects pause after 1 week of inactivity.

1. Go to https://supabase.com/dashboard
2. Find your project → Click **"Restore project"**
3. Wait ~2 minutes for it to resume
4. Your app will reconnect automatically — **no action needed**

---

### Scenario B: Project Deleted / Account Locked

Follow these steps to restore on a brand-new Supabase project.

#### Step 1 — Create New Supabase Project
1. Go to https://supabase.com → Sign up / sign in
2. Click **New Project** → fill in name, password, region (ap-south-1)
3. Wait for provisioning (~2 min)
4. Copy your new **Project URL** and **anon/public key** from Project Settings → API

#### Step 2 — Update App Config
Edit `c:\Users\User\Desktop\Sahiraah\sahiraah\.env`:
```env
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
```

Also update `src/integrations/supabase/client.ts`:
```ts
const SUPABASE_URL = "https://YOUR_NEW_PROJECT_ID.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_NEW_ANON_KEY";
```

#### Step 3 — Restore Schema & Static Data
1. Open Supabase SQL Editor (new project)
2. Copy-paste entire contents of `supabase/complete_database_setup.sql`
3. Click **Run** — should say "Success. No rows returned."

#### Step 4 — Restore Expert Accounts
1. In SQL Editor, paste `supabase/seed_all_experts.sql`
2. Click **Run**

#### Step 5 — (Optional) Restore Demo Data
1. In SQL Editor, paste `supabase/seed_demo_data.sql`
2. Click **Run**

#### Step 6 — Rebuild & Test
```powershell
cd c:\Users\User\Desktop\Sahiraah\sahiraah
npm run dev
```
Open http://localhost:8080 and test login.

---

## 💾 Running a Manual Backup

Generate a SQL snapshot of all static/config data:

```powershell
cd c:\Users\User\Desktop\Sahiraah\sahiraah
node supabase/scripts/backup_data.js
```

This saves a file like `supabase/backups/backup_2026-11-03.sql`.

**Schedule it** by adding a Windows Scheduled Task (weekly recommended):
1. Open Task Scheduler → Create Basic Task
2. Trigger: Weekly (e.g., Sunday midnight)
3. Action: `node C:\Users\User\Desktop\Sahiraah\sahiraah\supabase\scripts\backup_data.js`

---

## 🔄 Keeping Backups Safe (Recommended)

| Method | How |
|--------|-----|
| **Git** | Commit `supabase/backups/*.sql` to a **private** GitHub repo |
| **Google Drive** | Copy `supabase/backups/` folder to Drive weekly |
| **Email to yourself** | Attach latest backup SQL and email it |
| **Second Supabase project** | Create a `sahiraah-backup` project and run the backup SQL there |

> [!TIP]
> The most important files to keep safe are `complete_database_setup.sql` + `seed_all_experts.sql`.
> These two files alone can restore your entire app from scratch in ~10 minutes.

---

## 🏥 Health Check

To verify your database is healthy, run this in the SQL Editor:

```sql
SELECT
  (SELECT COUNT(*) FROM public.courses) AS courses,
  (SELECT COUNT(*) FROM public.experts) AS experts,
  (SELECT COUNT(*) FROM public.nsqf_qualifications) AS nsqf,
  (SELECT COUNT(*) FROM public.colleges) AS colleges,
  (SELECT COUNT(*) FROM public.career_pathways) AS pathways;
```

**Expected results:**

| courses | experts | nsqf | colleges | pathways |
|---------|---------|------|----------|----------|
| 18 | 4 | 13 | 3 | 3 |

---

## 📞 Support

- Supabase Status: https://status.supabase.com
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
