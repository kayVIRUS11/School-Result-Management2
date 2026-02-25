# School Result Management System

A web-based school result management system built with Next.js 14, TypeScript, Prisma, and NextAuth.js.

## Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: NextAuth.js v5 (Credentials provider)
- Styling: Tailwind CSS
- Icons: Lucide React
- Passwords: bcryptjs
- Validation: Zod

## Default Credentials

- Username: admin
- Password: admin123
- Role: Administrator

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd school-result-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database connection string and a secret key.

4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database:
   ```bash
   npx prisma db seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

```
src/
  app/
    admin/          - Admin dashboard and management pages
    staff/          - Staff portal pages
    student/        - Student portal pages
    api/            - API route handlers
    login/          - Login page
  components/       - Reusable UI components
  lib/              - Utility libraries (auth, prisma, grading, etc.)
  types/            - TypeScript type declarations
prisma/
  schema.prisma     - Database schema
  seed.ts           - Database seed script
```

## User Roles

- Admin: Full system access, manages students, staff, classes, subjects, sessions, and approves results
- Staff: Enters and submits student results
- Student: Views their approved results and profile

## Deployment

1. Set up a PostgreSQL database (e.g., on Railway, Supabase, or Neon).
2. Set the environment variables on your hosting platform.
3. Run `npx prisma migrate deploy` to apply migrations.
4. Run `npx prisma db seed` to seed initial data.
5. Deploy the Next.js app (e.g., on Vercel).
