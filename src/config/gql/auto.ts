import { buildSchema } from "drizzle-graphql";

import database from "../db/drizzle.js";

// Automatically generate the schema from the database
const { schema } = buildSchema(database);

export { schema };
