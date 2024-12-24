import type { JWT } from "@fastify/jwt";

import type database from "../db/drizzle.js";

declare module "mercurius" {
  interface MercuriusContext extends ResolverContext {}
}

interface ResolverContext {
  database: typeof database;
  user?: AuthTokenPayload;
  jwtSign: JWT["sign"];
}

interface AuthTokenPayload {
  id: string;
  name: string;
  username: string;
  role: string;
}
