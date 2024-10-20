import "dotenv/config";
import { type Config, defineConfig } from 'drizzle-kit';

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD || !ENDPOINT_ID)
  throw new Error('Missing environment variable(s)');

const config: Config = {
    schema: './src/db/schema.ts',
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