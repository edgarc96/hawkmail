import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

// Use local SQLite in development if Turso credentials are not available
const client = createClient({
  url: process.env.TURSO_CONNECTION_URL || 'file:sqlite.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;