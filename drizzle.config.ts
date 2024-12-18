import "dotenv/config";
import { type Config, defineConfig } from 'drizzle-kit';

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD)
  throw new Error('Missing environment variable(s)');

const config: Config = {
    schema: './src/config/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
      host: PGHOST,
      user: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE,
      ssl: true,
    },
  }

export default defineConfig(config);