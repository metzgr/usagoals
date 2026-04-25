# USA Goals

USA Goals is a Next.js prototype for exploring federal strategic goals using the live APEX corpus.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Live APEX API reads
- Qdrant-ready vector configuration

## Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

- `APEX_API_BASE_URL`
  Defaults to `https://apex.app.cloud.gov`.
- `QDRANT_URL`
  Optional for the current UI, but used by the vector client helper.
- `QDRANT_API_KEY`
  Optional for the current UI.
- `QDRANT_COLLECTION`
  Defaults to `usagoals-semantic-nodes`.
- `QDRANT_PORT`
  Optional. If omitted, the app uses the explicit URL port or falls back to `6333`.
- `QDRANT_CHECK_COMPATIBILITY`
  Optional. Defaults to `false`.

## Qdrant Verification

To verify that the configured cluster is reachable:

```bash
pnpm qdrant:verify
```

This prints a sanitized status summary and does not echo secrets.

## Routes

- `/`
- `/explore`
- `/agencies/[agencyId]`
- `/goals/[goalId]`
- `/themes/[tag]`
- `/compare`

## Notes

- The current APEX corpus is strategic-plan-heavy.
- Measures currently have limited actual performance values.
- Qdrant is configured as the prototype vector store, but the current build keeps retrieval server-side and read-only.
