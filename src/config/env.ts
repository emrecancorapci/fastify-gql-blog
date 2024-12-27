export const envSchema = {
  type: "object",
  required: ["DATABASE_URL", "PGHOST", "PGUSER", "PGPASSWORD", "PGDATABASE", "JWT_SECRET"],
  properties: {
    PGHOST: {
      type: "string",
    },
    PGUSER: {
      type: "string",
    },
    PGPASSWORD: {
      type: "string",
    },
    PGDATABASE: {
      type: "string",
    },
    DATABASE_URL: {
      type: "string",
    },
    JWT_SECRET: {
      type: "string",
    },
  },
};
