# Vector Database Decision For USA Goals

Assessed on April 25, 2026.

## Decision

Use **Qdrant Cloud** as the vector database for the USA Goals prototype.

## Why Qdrant Cloud Wins

Qdrant is the best fit for this stage because it optimizes for the constraints that matter most right now:

- low-risk personal-card prototyping
- strong metadata filtering
- native hybrid retrieval support
- simple migration path later
- lower lock-in than proprietary-only options

Official signals that matter:

- Qdrant's pricing page says the free tier is `Free forever` and intended `For testing, and prototypes`, with a `Single Node Cluster` and `0.5 vCPU / 1GB RAM/ 4 GB Disk`
- Qdrant documents hybrid and advanced search directly in product docs
- Qdrant supports snapshots and restore, which materially lowers migration risk
- Qdrant offers `Hybrid Cloud` where you can bring your own infrastructure while using Qdrant's management plane

## Why Not The Other Leading Options

### Pinecone

Pinecone is strong technically, but it is not the best fit for this project right now.

Pros:

- mature managed product
- metadata filtering
- hybrid search
- good developer ergonomics

Cons:

- paid production plan currently has a `$50/month` minimum
- more vendor-dependent long term
- less attractive if we later need to migrate into a government-controlled environment or replace the service without rewriting assumptions

Verdict:

- great product
- not the best prototype economics or migration story for USA Goals

### Weaviate Cloud

Weaviate is also strong and open-source, but it is weaker than Qdrant for this specific choice.

Pros:

- open-source
- good hybrid search
- self-host / managed / VPC options

Cons:

- paid entry point currently starts at `$45/month`
- more platform surface area than we need for the first prototype

Verdict:

- strong second-place option
- not as compelling as Qdrant Cloud on cost-to-flexibility ratio

### PostgreSQL + pgvector

This is attractive for simplicity, but it should not be the primary recommendation here.

Pros:

- relational + vector in one store
- easy joins with app data
- good fit for very small workloads
- AWS RDS docs show `pgvector` support on RDS PostgreSQL

Cons:

- filtered ANN retrieval needs more care
- Supabase's pgvector docs explicitly warn that naive filtering with IVFFlat/HNSW can return fewer rows than requested
- hybrid retrieval and search-specific tuning are not as strong or ergonomic as a purpose-built vector engine
- Cloud.gov does not explicitly guarantee `pgvector` on its brokered RDS service

Verdict:

- good fallback if we intentionally simplify into a single relational store
- not the best dedicated vector choice

## How This Fits USA Goals

For USA Goals, the vector layer needs to do a narrow set of jobs well:

- embed semantic nodes from APEX
- return related goals and objectives quickly
- support metadata filters like `agency_id`, `document_id`, `node_type`, `topic`, and `fiscal_year`
- support hybrid retrieval when we want lexical constraints plus semantic similarity
- stay easy to replace later if procurement or compliance changes the architecture

Qdrant matches that shape well.

It is also a better fit than over-indexing on a `cloud.gov` marketplace-native solution too early. For a prototype, speed and clarity matter more than pre-optimizing for a future procurement boundary.

## Recommended Architecture

Do not use the vector database as the only datastore.

Use:

- `Qdrant Cloud` for embeddings and similarity retrieval
- PostgreSQL for application data, cached APEX records, user data, annotations, and graph edges

Suggested record payload in Qdrant:

- `node_id`
- `node_type`
- `entity_id`
- `title`
- `agency_id`
- `agency_name`
- `document_id`
- `document_title`
- `fiscal_year`
- `tags`
- `source_page`
- `content_hash`
- `updated_at`

That is enough to filter and display useful results without making Qdrant the system of record.

## Migration Plan

Phase 1:

- use Qdrant Cloud directly
- pay with a personal card if needed
- connect from the app using API key auth

Phase 2:

- bind Qdrant to the `cloud.gov` app as an external service via a user-provided service

Phase 3 options if stakeholders fund production:

- keep Qdrant Cloud if acceptable
- move to Qdrant hybrid/private deployment if control requirements tighten
- or re-index into `cloud.gov` OpenSearch if a marketplace-native service becomes politically or operationally easier

## Practical Recommendation

If you want the fastest path:

1. Create a Qdrant Cloud account.
2. Start on the free tier.
3. Build the retrieval layer against Qdrant now.
4. Revisit only after real usage proves we need a different deployment model.

This is the best decision for the prototype.

## Sources

- Qdrant pricing: https://qdrant.tech/pricing/
- Qdrant docs: https://qdrant.tech/documentation/
- Qdrant search docs: https://qdrant.tech/documentation/search/
- Qdrant snapshots: https://qdrant.tech/documentation/operations/snapshots/
- Pinecone pricing: https://www.pinecone.io/pricing/
- Pinecone metadata filtering: https://docs.pinecone.io/guides/search/filter-by-metadata
- Pinecone hybrid search: https://docs.pinecone.io/guides/search/hybrid-search
- Weaviate pricing: https://weaviate.io/pricing
- Weaviate platform: https://weaviate.io/platform
- Weaviate backups: https://docs.weaviate.io/deploy/configuration/backups
- Supabase pgvector docs: https://supabase.com/docs/guides/database/extensions/pgvector
- Cloud.gov external services: https://docs.cloud.gov/platform/services/intro/
- AWS OpenSearch vector search: https://docs.aws.amazon.com/opensearch-service/latest/developerguide/vector-search.html
- AWS RDS PostgreSQL extensions: https://docs.aws.amazon.com/AmazonRDS/latest/PostgreSQLReleaseNotes/postgresql-extensions.html
