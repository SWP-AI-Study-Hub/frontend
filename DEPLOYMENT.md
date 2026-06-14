# Frontend Production Deployment

The Next.js frontend is deployed from `main` with Vercel Git integration.
GitHub Actions validates the application; Vercel owns preview and production
deployments.

## 1. Import the Project

1. Sign in at <https://vercel.com> with the team GitHub account.
2. Select **Add New > Project**.
3. Import `SWP-AI-Study-Hub/frontend`.
4. Keep **Framework Preset** as Next.js.
5. Keep **Root Directory** as `./` because this is a standalone repository.
6. Keep the default commands:
   - Install: `npm install`
   - Build: `npm run build`
   - Output: Next.js default

## 2. Production Environment Variables

In **Project Settings > Environment Variables**, add the real Firebase Web App
configuration. Enable each variable for both **Production** and **Preview**:

| Variable | Environment |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Production, Preview |

Example API value:

```env
NEXT_PUBLIC_API_BASE_URL=https://ai-study-hub-backend.onrender.com/api
```

Only put `NEXT_PUBLIC_*` browser configuration in Vercel. Never add
`DATABASE_URL`, Firebase Admin private keys, R2 secret keys, or Gemini keys.
After adding or changing variables, redeploy the latest deployment because
Vercel does not inject new values into an already-built deployment.

## 3. Firebase Authorization

In **Firebase Console > Authentication > Settings > Authorized domains**, add:

```text
<vercel-project>.vercel.app
```

Add the custom production domain too if the team configures one.

## 4. GitHub Protection

In **GitHub > Settings > Branches**, protect `main`:

1. Require pull requests.
2. Require at least one approval.
3. Require the `Frontend validation` status check.
4. Require branches to be up to date before merging.
5. Prevent direct pushes by regular contributors.

Vercel may still create previews for feature branches and pull requests.
Only merges to `main` become production.

## 5. Connect the Backend

After Vercel assigns the production URL, set the backend Render variable:

```env
CORS_ORIGIN=https://<vercel-production-domain>
```

Do not include a trailing slash. The backend supports comma-separated origins
if a custom production domain is added later:

```env
CORS_ORIGIN=https://app.example.com,https://project.vercel.app
```

## 6. Verify and Roll Back

After deployment:

1. Open the Vercel production URL.
2. Sign in with Firebase.
3. Confirm API requests target the Render URL, not `localhost`.
4. Check the browser console and Vercel deployment logs.

To roll back, open **Vercel > Project > Deployments**, select a previous
successful deployment, and promote it to Production.
