# Finance Assistant

Personal finance management web application with an AI-powered conversational assistant.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MySQL
- **ORM:** Prisma
- **AI:** OpenAI API _(Phase 5+)_

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL server running locally

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd finance-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Create the database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS finance_assistant;"

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start the development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Phase 5+ |

### Useful Commands

```bash
# Development server
npm run dev

# Prisma Studio (database GUI)
npx prisma studio

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build for production
npm run build
```

## Development Phase

Currently on **Phase 1 — Project Setup + Database Foundation**.

## License

Private project.
