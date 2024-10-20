import fastify from "fastify";
import { fastifyEnv } from "@fastify/env";

const app = fastify({ logger: true });

app.register(fastifyEnv);

app.listen({ port: 8080 }, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
