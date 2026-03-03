// Example prisma.config.ts — update/merge into your existing file
import { defineConfig } from 'prisma'
import path from 'path'

export default defineConfig({
  migrations: {
    // Configure Prisma to run the TypeScript seed via ts-node
    // Adjust command if you prefer another approach (e.g., compiled JS)
    seed: 'npx ts-node --transpile-only prisma/seed.ts',
  },
  // datasource config (may already exist in your file)
  datasource: {
    // Keep using process.env.DATABASE_URL in env
    url: process.env.DATABASE_URL,
  },
})
