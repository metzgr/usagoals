import { QdrantClient } from "@qdrant/js-client-rest";

type VectorLayerStatus = {
  provider: "Qdrant Cloud";
  configured: boolean;
  url: string | null;
  port: number | null;
  collection: string;
};

let qdrantClient: QdrantClient | null | undefined;

export function getQdrantCollection() {
  return process.env.QDRANT_COLLECTION || "usagoals-semantic-nodes";
}

function getBooleanEnv(name: string, fallback = false) {
  const value = process.env[name];

  if (value === undefined || value === "") {
    return fallback;
  }

  return value === "true";
}

function getQdrantConnectionConfig() {
  const rawUrl = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!rawUrl || !apiKey) {
    return null;
  }

  const parsed = new URL(rawUrl);
  const port = process.env.QDRANT_PORT
    ? Number(process.env.QDRANT_PORT)
    : parsed.port
      ? Number(parsed.port)
      : 6333;

  return {
    apiKey,
    checkCompatibility: getBooleanEnv("QDRANT_CHECK_COMPATIBILITY", false),
    host: parsed.hostname,
    https: parsed.protocol === "https:",
    port,
    prefix: parsed.pathname !== "/" ? parsed.pathname : undefined,
    rawUrl,
  };
}

export function getVectorLayerStatus(): VectorLayerStatus {
  const config = getQdrantConnectionConfig();

  return {
    provider: "Qdrant Cloud",
    configured: Boolean(config),
    url: config?.rawUrl ?? null,
    port: config?.port ?? null,
    collection: getQdrantCollection(),
  };
}

export function getQdrantClient() {
  if (qdrantClient !== undefined) {
    return qdrantClient;
  }

  const config = getQdrantConnectionConfig();

  if (!config) {
    qdrantClient = null;
    return qdrantClient;
  }

  qdrantClient = new QdrantClient({
    host: config.host,
    https: config.https,
    port: config.port,
    prefix: config.prefix,
    apiKey: config.apiKey,
    checkCompatibility: config.checkCompatibility,
  });

  return qdrantClient;
}
