import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

const dbConfig: Config = defineConfig({
  schema: ['./src/db/schema.ts', './src/db/schema-webhooks.ts'],
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL || 'file:sqlite.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});

export default dbConfig;