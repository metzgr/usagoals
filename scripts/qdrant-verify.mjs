import { QdrantClient } from "@qdrant/js-client-rest";

function getBooleanEnv(name, fallback = false) {
  const value = process.env[name];

  if (value === undefined || value === "") {
    return fallback;
  }

  return value === "true";
}

function resolveQdrantConfig() {
  const rawUrl = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;
  const collection = process.env.QDRANT_COLLECTION || "usagoals-semantic-nodes";

  if (!rawUrl || !apiKey) {
    throw new Error(
      "QDRANT_URL and QDRANT_API_KEY must both be set before verifying Qdrant.",
    );
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
    collection,
    host: parsed.hostname,
    https: parsed.protocol === "https:",
    port,
    prefix: parsed.pathname !== "/" ? parsed.pathname : undefined,
  };
}

function formatFailure(error) {
  const connectTimeout = error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
  const status = error?.status;
  const body = typeof error?.data === "string" ? error.data : "";

  if (connectTimeout) {
    return {
      kind: "timeout",
      message:
        "Connection timed out before the cluster responded. This usually means the chosen port or endpoint is blocked from this network.",
    };
  }

  if (status === 403 && /zscaler/i.test(body)) {
    return {
      kind: "firewall",
      message:
        "The request reached an upstream web filter instead of Qdrant. Outbound access to the cluster is being blocked from this network.",
    };
  }

  if (status === 401 || status === 403) {
    return {
      kind: "auth",
      message:
        "The endpoint responded, but the request was not authorized. Re-check the API key and cluster permissions.",
    };
  }

  return {
    kind: "unknown",
    message: error?.message || "Qdrant verification failed for an unknown reason.",
  };
}

async function main() {
  const config = resolveQdrantConfig();
  const client = new QdrantClient({
    host: config.host,
    https: config.https,
    port: config.port,
    prefix: config.prefix,
    apiKey: config.apiKey,
    checkCompatibility: config.checkCompatibility,
    timeout: 30_000,
  });

  try {
    const collections = await client.getCollections();
    const collectionExists = collections.collections.some(
      (entry) => entry.name === config.collection,
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          provider: "Qdrant Cloud",
          port: config.port,
          collection: config.collection,
          collectionExists,
          collectionCount: collections.collections.length,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const failure = formatFailure(error);

    console.error(
      JSON.stringify(
        {
          ok: false,
          provider: "Qdrant Cloud",
          port: config.port,
          collection: config.collection,
          errorKind: failure.kind,
          message: failure.message,
        },
        null,
        2,
      ),
    );

    process.exitCode = 1;
  }
}

await main();
