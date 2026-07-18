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

- **Dual Port Support**: The application runs on **port 3030** (default for Docker) and **port 3000** (native)
- **Integrated Supabase**: Dockerized PostgreSQL database with Supabase
- **Environment Variables**: Automatic configuration of Supabase keys and app URLs
- **Volume Persistence**: Persistent data storage with named volumes

## Project Overview

System Design Arena is an interactive platform for practicing and discussing system design problems. The project features:

- **Problem Library**: Curated collection of system design questions
- **Real-time Collaboration**: Interactive whiteboard for designing solutions
- **Expert Solutions**: Community‑reviewed solution patterns
- **Interview Preparation**: Common system design interview scenarios

## Key Features

### Problem Library
- Browse hundreds of system design problems
- Filter by difficulty, topic, and company
- Mark problems as completed or bookmarked

### Collaborative Workspace
- Draw and diagram solution architectures
- Share workspaces with team members
- Real‑time collaboration with peers

### Solution Database
- Access expert solution patterns
- Compare different approaches to the same problem
- Learn best practices and trade‑offs

## Technologies Used

### Frontend
- **Next.js 16** with Turbopack for fast development
- **React 19** for component architecture
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** for data persistence

### Visualization
- **React Flow** for interactive diagrams
- **Lucide React** for icons

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │───▶│  Next.js    │───▶│  Supabase   │
└─────────────┘    │  App (3030) │    │  Database   │
                   └─────────────┘    └─────────────┘
                        │                       │
                        │  ┌─────────────────┐ │
                        └──►│  PostgreSQL     │◄─┘
                            │  (via Supabase) │
                            └─────────────────┘
```

## Development Workflow

### Local Development
1. Ensure Docker is running
2. Run `npm run docker:up` to start with database
3. Run `npm run dev` to start Next.js on port 3030
4. Access at `http://localhost:3030`

### Production Deployment
1. Run `npm run docker:build` to create the image
2. Run `npm run docker:up` to deploy
3. Application will be available on port 3030

## Project Structure

```
.
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript definitions
├── public/              # Static assets
├── supabase/            # Supabase configuration
├── docker-compose.yml    # Docker configuration
├── package.json          # Dependencies and scripts
└── next.config.ts        # Next.js configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run lint`
5. Commit and push your changes
6. Submit a pull request

## License

MIT © 2024 System Design Arena Contributors

## Getting Help

For questions and discussions:

- Check the [GitHub Discussions](https://github.com/andrzj/system-design-arena/discussions)
- Join our community chat
- Report bugs in the [Issues](https://github.com/andrzj/system-design-arena/issues)
