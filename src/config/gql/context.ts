import type database from "../db/drizzle.js";
import type { JWT } from "@fastify/jwt";

declare module "mercurius" {
  interface MercuriusContext extends ResolverContext {}
}

interface ResolverContext {
  database: typeof database;
  user?: TokenPayload;
  jwtSign: JWT["sign"];
}

interface TokenPayload {
  id: string;
  name: string;
  username: string;
  role: string;
}
