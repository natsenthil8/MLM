# Vercel + Supabase deployment

This branch contains a serverless conversion of the original Express backend into Vercel serverless functions backed by Supabase (Postgres).

What changed
- Added /api serverless functions (admin-login, member-login, register, members, summary, logout).
- Updated app.js to store admin JWT and send Authorization header for protected endpoints.

Supabase setup
1. Create a Supabase project at https://app.supabase.com
2. In the SQL editor, run:

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  sponsor text,
  plan text NOT NULL,
  amount integer,
  commission text,
  status text,
  created_at timestamptz DEFAULT now()
);

Vercel environment variables (set in your Vercel project settings)
- SUPABASE_URL = https://<your-project>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY = <service_role_key>  (KEEP THIS SECRET)
- JWT_SECRET = <random-secret>
- ADMIN_USERNAME = admin
- ADMIN_PASSWORD = <strong-password>

Local development
- Use `vercel dev` (Vercel CLI) and set environment variables locally (e.g., via .env) for testing.

Security notes
- Do not commit SUPABASE_SERVICE_ROLE_KEY or JWT_SECRET to the repository.
- Replace demo credentials before production.
