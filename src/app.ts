import fastify from "fastify";
import mercurius from "mercurius";
import { AltairFastify } from "altair-fastify-plugin";
import fastifyEnv from "@fastify/env";

import database, { getPgVersion } from "./config/db/drizzle.js";
import schema from "./schema/schema.js";
import { resolvers } from "./schema/resolvers.js";
import { auth } from "./middlewares/auth.js";

const app = fastify();

await app.register(fastifyEnv, { dotenv: true });
await app.register(auth);

app.register(mercurius, {
  schema,
  resolvers: resolvers,
  context: (request, reply) => {
    return { database, user: request.user, jwtSign: app.jwt.sign };
  },
  graphiql: false,
  ide: false,
  path: "/graphql",
});

app.register(AltairFastify, {
  path: "/docs/gql",
  baseURL: "/docs/gql/",
  endpointURL: "/graphql",
});

app.listen({ port: 8080 }, async (err, address) => {
  await getPgVersion();

  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
