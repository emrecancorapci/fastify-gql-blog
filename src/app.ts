import fastify from "fastify";
import { fastifyEnv } from "@fastify/env";
import { getPgVersion } from "./db/drizzle.js";

const app = fastify({ logger: true });

app.register(fastifyEnv);

app.listen({ port: 8080 }, async (err, address) => {
  await getPgVersion();

  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
