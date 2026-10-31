# Argos AI — Frontend

Web application of **Argos AI**, a SaaS that connects a user's code repositories (GitHub, GitLab) and hosting services (Railway, Render), collects their production logs in real time, and uses AI to detect errors, explain them in plain language and notify the right people by email or SMS.

- Live app: https://www.ai-argos.com
- Backend repository: https://github.com/DwainAB/argos-back

## Features

- **Landing page** — product presentation, pricing, SEO (sitemap, robots, metadata).
- **Authentication** — sign-in and sign-up with [Clerk](https://clerk.com): email/password, Google, GitHub, GitLab. Shows which account is signed in and lets users switch accounts.
- **Onboarding** — after sign-up, the user chooses a personal or organization account.
- **Dashboard**
  - Overview and project list
  - Project creation: connect a repository (GitHub App, GitLab) and a hosting service (Railway, Render)
  - Real-time logs with AI explanations, alerts and fix suggestions
  - Security and code analysis of the repository
  - Notifications, organization members and roles, project sharing
  - Subscription and billing (Stripe)
  - Settings: theme, phone number for SMS alerts, Render API keys, connected accounts
- **Account management** — handled by Clerk's account menu: password, emails, linked accounts, MFA, active sessions, sign-out and account switching.
- **Light and dark themes**, applied to the Clerk components as well.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| Authentication | Clerk (`@clerk/nextjs`, French localization, `@clerk/themes`) |
| Charts | Recharts |
| 3D / visuals | three.js, React Three Fiber, Motion |
| Analytics | Vercel Analytics |
| Tests | Vitest, Testing Library |

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/, signup/       # Clerk sign-in / sign-up (catch-all routes)
│   ├── onboarding/           # Account type selection after sign-up
│   └── dashboard/            # Authenticated area (projects, logs, alerts, settings…)
├── components/
│   ├── auth/                 # Auth layout, signed-in notice
│   ├── dashboard/            # Sidebar, header, sections and forms
│   ├── landing/              # Landing page sections
│   ├── theme/                # Theme provider, Clerk theme
│   ├── icons/, ui/           # Shared UI
├── lib/
│   ├── api-fetch.ts          # Calls to the backend with the Clerk session token
│   ├── auth.ts               # Current user, onboarding, phone number
│   └── use-*.ts              # Data hooks (projects, organization…)
└── middleware.ts             # Protects /dashboard and /onboarding (Clerk)
```

The frontend and the API are hosted on different domains, so every API call goes through `apiFetch`, which adds the Clerk session token in the `Authorization: Bearer` header. A strict Content-Security-Policy (`next.config.js`) whitelists the external origins actually used.

## Getting started

### Prerequisites

- Node.js 24
- The backend running locally (see the backend repository)
- A Clerk application (development instance)

### Installation

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `http://localhost:4000`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (used by the middleware) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used for SEO metadata (optional) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run the test suite |
| `npm run test:coverage` | Run tests with coverage report |

## Tests and CI

Component and library tests use Vitest and Testing Library. GitHub Actions runs on every pull request and push to `main`: install, lint, tests and production build. The build needs the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` repository variable.

## Deployment

The app is deployed on Vercel from the `main` branch.

## Contributing

- Work on a dedicated branch (`feature/…`, `fix/…`, `docs/…`); `main` only changes through pull requests.
- Code comments and commit messages are written in French; code and technical documentation in English.
