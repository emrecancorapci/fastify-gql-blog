import fastify from "fastify";
import mercurius, { type IResolvers } from "mercurius";

import { AltairFastify as altairFastify } from "altair-fastify-plugin";
import database, { getPgVersion } from "./config/db/drizzle.js";
import schema from "./config/gql/schema.js";

const app = fastify();

const resolvers: IResolvers = {};

app.register(mercurius, {
  schema,
  resolvers,
  context: (request, reply) => {
    return { database };
  },
  graphiql: false,
  ide: false,
  path: "/graphql",
});

app.register(altairFastify, {
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
