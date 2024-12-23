import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";

export const auth = fp(async function authHook(fastify, options) {
  const { JWT_SECRET } = fastify.getEnvs() as { JWT_SECRET: string | undefined };

  if (!JWT_SECRET) {
    throw Error("JWT_SECRET enviroment haven't set.");
  }

  await fastify.register(fastifyJwt, { secret: JWT_SECRET });
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});
