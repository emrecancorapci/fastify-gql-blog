import fastify from "fastify";
import { AltairFastify as altairFastify } from "altair-fastify-plugin";
import { buildSchema } from "drizzle-graphql";
import database, { getPgVersion } from "./db/drizzle.js";
import mercurius, { type IResolvers } from "mercurius";

const app = fastify();
const { schema } = buildSchema(database);

const resolvers: IResolvers = {};

app.register(mercurius, {
  schema,
  resolvers,
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
