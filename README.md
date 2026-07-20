This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3030](http://localhost:3030) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Docker Support

This project includes Docker and Docker Compose support for easy deployment:

### Build and Run

```bash
# Build the Docker image
npm run docker:build

# Start with Docker Compose
npm run docker:up

# View logs
npm run docker:logs

# Stop and remove containers
npm run docker:down

# Clean everything (including images)
npm run docker:clean
```

### Features

- **Port 3030**: The application runs on **port 3030** (default for Docker)
- **External Supabase**: Connects to an external Supabase instance via environment variables
- **Environment Variables**: Automatic configuration of Supabase keys and app URLs
- **Volume Persistence**: Persistent data storage with named volumes

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL="postgresql://postgres:postgres@supabase.local:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL="http://localhost:3030"
```

### Self-Hosted Supabase Auth (Phase 1)

When using a local Supabase stack (`supabase.local`):

1. Enable **Auth** and the **Email** provider in the Supabase dashboard/API.
2. Set **Site URL** to `http://localhost:3030`.
3. Add redirect URLs: `http://localhost:3030/**`.
4. OAuth providers are optional for MVP — Phase 1 uses email/password only.
5. Ensure `DATABASE_URL` points at the same Postgres instance used by Supabase so Prisma `Profile` rows stay in sync with `auth.users`.

After sign-up, the app creates a `profiles` row via Prisma (`Profile.id` = Supabase user UUID).

### Docker Compose Configuration

The `docker-compose.yml` file is configured to:

- Build the Next.js application
- Expose port 3030
- Connect to an external Supabase instance (not included in the compose file)
- Mount source code and public assets for live reloading
- Restart automatically on crashes

### Production Deployment

1. Run `npm run docker:build` to create the image
2. Run `npm run docker:up` to deploy
3. Application will be available on port 3030

### Development Workflow

1. Ensure Docker is running
2. Run `npm run docker:up` to start with database
3. Run `npm run dev` to start Next.js on port 3030
4. Access at `http://localhost:3030`

### E2E tests (Playwright)

One-time browser install (required before first run):

```bash
npm run test:e2e:install
```

Run auth flow tests (dev server on `:3030`, Supabase up):

```bash
npm run test:e2e
```
