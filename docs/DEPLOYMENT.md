# Deployment and environment setup

This document explains how to configure and deploy the MLM demo site.

## Required environment variables

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (only needed if server-side Supabase operations are used)
- ADMIN_USERNAME
- ADMIN_PASSWORD
- JWT_SECRET

## Local development

1. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the dev server (if this is a Next/Vercel project):
   ```bash
   npm run dev
   ```

4. Test admin login endpoint locally:
   ```bash
   curl -i -X POST -H "Content-Type: application/json" -d '{"username":"<user>","password":"<pw>"}' http://localhost:3000/api/admin-login
   ```

## Vercel deployment (recommended)

1. Create a project on Vercel and link it to this repository.
2. Add the required environment variables to the Vercel project (Dashboard → Settings → Environment Variables):
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
   - JWT_SECRET

3. (Optional) To enable automated CI-driven deploys using GitHub Actions, add the following repository secrets in GitHub (Settings → Secrets → Actions):
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID

4. Merge the branch and push to `main` (or your production branch). The project will deploy automatically if linked.

## GitHub Actions deploy (optional)

A sample workflow is provided at `.github/workflows/deploy-vercel.yml` which uses `amondnet/vercel-action`. It requires the Vercel secrets described above.

## Notes

- Never commit real secrets to the repo. Use `.env` locally and platform secrets for remote deployments.
- The `api/admin-login.js` now performs basic environment validation and logs errors to help diagnose runtime failures.
