import "dotenv/config";
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import Ajv from "ajv";

export enum NodeEnv {
  development = "development",
  test = "test",
  production = "production",
}

const ConfigSchema = Type.Strict(
  Type.Object({
    NODE_ENV: Type.Enum(NodeEnv),
    LOG_LEVEL: Type.String(),
    API_HOST: Type.String(),
    API_PORT: Type.String(),
    MONGO_URI: Type.String(),
    JWT_SECRET: Type.String(),
    OPENAI_API_KEY: Type.String(),
    REPLICATE_API_TOKEN: Type.String(),
    WEBHOOK_URL: Type.String(),
    WEBHOOK_SECRET: Type.String(),
    MINIO_URL: Type.String(),
    MINIO_ACCESS_KEY: Type.String(),
    MINIO_SECRET_KEY: Type.String(),
    MINIO_BUCKET: Type.String(),
  })
);

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  allowUnionTypes: true,
});

export type Config = Static<typeof ConfigSchema>;

const configPlugin: FastifyPluginAsync = async (server) => {
  const validate = ajv.compile(ConfigSchema);
  const valid = validate(process.env);
  if (!valid) {
    throw new Error(
      ".env file validation failed - " +
        JSON.stringify(validate.errors, null, 2)
    );
  }
  server.decorate("config", process.env);
};

declare module "fastify" {
  interface FastifyInstance {
    config: Config;
  }
}

export default fp(configPlugin);
