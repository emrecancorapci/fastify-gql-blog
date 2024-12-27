import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const queryClient = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
});

const database = drizzle(queryClient, { schema });

export async function getPgVersion() {
  const result = await queryClient`select version()`;

  console.log(result);
}

export default database;
