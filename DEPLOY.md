# Deployment Guide - Mackron AI

## Step 1: Push to GitHub

```bash
cd d:\MACKRON_AI
git add .
git commit -m "Initial commit: Mackron AI Testing Agent"
gh repo create mackron-ai --public --push --source .
```

Or create a repository on GitHub.com and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mackron-ai.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to [https://render.com](https://render.com)
2. Click "New" > "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Name**: `mackron-ai-api`
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: Free
5. Environment Variables:
   - `PORT`: `8080`
   - `SPRING_PROFILES_ACTIVE`: `prod`
6. Click "Create Web Service"
7. Note the generated URL (e.g., `https://mackron-ai-api.onrender.com`)

## Step 3: Update Frontend API URL

Edit `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR-RENDER-URL.onrender.com/api'
};
```

Commit and push the change.

## Step 4: Deploy Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repo
4. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npx ng build --configuration=production`
   - **Output Directory**: `dist/frontend/browser`
   - **Framework Preset**: Other
5. Click "Deploy"
6. Note the generated URL (e.g., `https://mackron-ai.vercel.app`)

## Verify Deployment

1. Visit your Vercel URL
2. Navigate to "New Test"
3. Enter a public URL (e.g., `https://the-internet.herokuapp.com/login`)
4. Select "Login" feature
5. Click "Start Test Execution"
6. Watch live test execution
7. View the generated report

## Architecture

- Frontend (Vercel) -> Angular 19 SPA, publicly accessible
- Backend (Render) -> Spring Boot + Playwright, headless browser testing
- Communication: REST API + SSE for live streaming
