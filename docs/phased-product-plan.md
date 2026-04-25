# USA Goals Phased Product Plan

Assessed on April 25, 2026.

## Recommendation

Build this in phases as a **federal strategy intelligence platform first**, not a full `Performance.gov` replacement on day one.

The current APEX API is already strong enough to support a compelling public-facing app for:

- discovery of federal strategic goals
- cross-agency topic exploration
- source-linked evidence review
- semantic similarity and related-goal experiences
- typed network analysis
- machine-readable exports and API-native downstream integrations

It is **not** yet strong enough to support the most ambitious `Performance.gov` behaviors around:

- calls-to-action
- subscriptions and engagement loops
- creator-side publishing workflows
- blog/resources/events
- stakeholder directories
- time-series progress tracking with real actuals
- ongoing quarterly reporting

That means the right product story is:

> "A strategy intelligence and coordination layer for U.S. goals today, with a clear path to a richer Performance.gov-style action platform as more upstream data and authoring workflows come online."

## What The API Can Support Today

Live APEX data checked on April 25, 2026:

- `38` agencies in `/api/agencies`
- `13` source documents in `/api/documents`
- all `13` documents currently classified as `strategic_plan`
- `42` goals in `/api/goals`
- `136` objectives nested under goals
- `125` measures in `/api/measures`
- `218` semantic nodes in `/api/semantic/manifest`
- `474` semantic edges in `/api/semantic/edges`
- `115` cross-agency `shared_priority` edges
- `7` themes and `7` normalized topics

Important constraints in the current corpus:

- Only `13` agencies currently have ingested source documents.
- The corpus is strategic-plan-heavy, not quarterly-report-heavy.
- `0` measures currently expose `actual_value`.
- `0` stakeholder relations are populated in goals/objectives.
- `report-measures` exists in the contract, but sampled strategic-plan documents return empty arrays.

## Vision vs. Current Reality

| Aspirational Performance.gov capability | Current APEX support | What we can build now | What is missing |
| --- | --- | --- | --- |
| Search the federal strategic portfolio | Strong | Global search, filters, topic pages, agency pages | Better ranking and UX only |
| Browse goals, objectives, and metrics | Strong | Goal detail pages, objective trees, measure tables | More consistent measure quality |
| Cross-agency discovery around issues | Strong | Themes, topics, related-goal graph, shared-priority explorer | Broader corpus coverage |
| View evidence behind claims | Strong | PDF viewer, citations, source-page highlighting | Better annotation UX |
| Download machine-readable data | Strong | API explorer, JSON export, CSV export from app | Packaging and docs only |
| Similarity search and semantic retrieval | Strong | Semantic node index, related-content recommendations, AI briefs | Embedding/vector layer in our app |
| Network analysis | Strong | Graph explorer using typed semantic edges | More relationship types over time |
| Agency/goal performance progress over time | Weak | Baseline/target snapshots where present | Actuals, updates, time series |
| Calls-to-action for outside stakeholders | None | Not from API | Must be authored in our app or upstream |
| Subscriptions and alerts | None | Can add app-owned saves and alerts | Requires our own user system |
| Creator publishing workflows | None | None | Requires write APIs or separate CMS |
| Stories, blog, resources, events | None | None from API | Must be app-owned content |
| Stakeholder directory / coalition map | Weak | Agency mention map only | External stakeholders are absent |
| Engagement dashboard for creators | None | None | Requires product analytics + authoring layer |

## Product Positioning

The most credible near-term product is:

**USA Goals: a map of the U.S. strategic portfolio**

Core promise:

- show what agencies say they are trying to achieve
- connect related goals across agencies
- let users inspect the source evidence directly
- help users identify where their issue area already appears in federal strategy

This is already valuable to:

- policy staff
- researchers
- advocacy teams
- government affairs teams
- journalists
- vendors and grantees

## Phased Build Plan

## Phase 1: Strategy Explorer MVP

Goal: launch the first investor/stakeholder demo using only current APEX data.

User-facing scope:

- homepage with bold explanation of the federal strategy graph
- global search over goals, objectives, and measures
- agency profile pages using `/api/agencies/{agency_id}/profile`
- goal detail pages with summary, objectives, measures, citations, and PDF evidence
- theme pages and normalized topic pages
- compare view using `/api/compare`
- API/data download page for credibility

Why this phase matters:

- It demonstrates immediate utility.
- It is fully compatible with the current API.
- It creates a credible "this already works" investor story.

Technical scope:

- Next.js app deployed to `cloud.gov`
- direct reads from APEX API
- local caching layer for performance
- polished document viewer with source-page jump links

Demo moments:

- "Show me every federal goal connected to workforce."
- "Compare OPM, NSF, and DOL strategy measures."
- "Open the original PDF evidence behind a goal summary."

Exit criteria:

- public read-only app is working
- fast search and browsing feel solid
- evidence/provenance is visible everywhere

## Phase 2: Semantic Discovery Layer

Goal: turn the MVP from a directory into an intelligence product.

User-facing scope:

- "related goals" recommendations
- cross-agency goal graph
- shared-priority network explorer
- "who else is working on this?" side panel on every goal/topic
- AI-generated issue brief pages grounded in semantic nodes plus citations
- similarity-driven discovery beyond keyword search

Why this phase matters:

- This is the first real "wow" layer.
- It gets much closer to the aspirational Performance.gov discovery model.
- It uses the strongest part of the API: semantic nodes, edges, manifest, and changes.

Technical scope:

- ingest `/api/semantic/nodes`
- sync via `/api/semantic/manifest` and `/api/semantic/changes`
- ingest `/api/semantic/edges` and `/api/semantic/shared-priority-edges`
- build vector or hybrid search index
- compute graph metrics such as degree, bridge goals, and cross-agency clusters

Exit criteria:

- every goal has related goals and graph neighbors
- users can traverse from issue -> topic -> goal -> related goal -> source evidence
- semantic sync pipeline is repeatable

## Phase 3: Analyst Workspace

Goal: make the product useful for repeat users, not just demo viewers.

User-facing scope:

- saved topics and saved agencies
- watchlists for goals and themes
- change tracking based on semantic snapshot/change endpoints
- downloadable briefing packs
- shareable collections
- internal notes and annotations

Why this phase matters:

- It creates retention.
- It starts to mimic the "visit often to stay on top of opportunities" part of the vision.
- It does not depend on upstream calls-to-action being present.

Technical scope:

- app-owned auth
- Postgres tables for users, collections, alerts, and annotations
- scheduled jobs to detect corpus updates
- email digest or export pipeline

Exit criteria:

- users can save and revisit strategy areas
- change alerts work when corpus updates land
- analysts can create and share narrative outputs

## Phase 4: Action Layer Added By Us

Goal: add the missing engagement/product layer even though the API does not currently provide it.

User-facing scope:

- manual calls-to-action attached to goals or topics
- curated resources and event links
- editorial explainers
- "how to engage" sidebars for each issue area
- basic submission or feedback flows

Why this phase matters:

- This is how we bridge from "intelligence product" to "participation product."
- It compensates for the biggest current API gap.

Technical scope:

- admin CMS in our app
- Postgres-backed editorial tables
- moderation workflow
- analytics on CTA clicks and page engagement

Important note:

This phase is **not API-derived**. It is product-owned content layered on top of APEX.

## Phase 5: Full Performance Reporting Layer

Goal: move toward the true Performance.gov vision once upstream data matures.

Needed upstream improvements:

- more documents and more agencies
- performance reports in addition to strategic plans
- quarterly progress narratives
- actuals and time-series measure updates
- stakeholder relations
- official calls-to-action
- creator-side publishing workflows

Only after that can we credibly build:

- true progress dashboards
- trend lines over time
- creator portals
- public subscriptions at scale
- author analytics
- richer civic participation loops

## Cloud.gov Architecture Recommendation

## Default stack

- Frontend/app: Next.js on `cloud.gov`
- App database: `aws-rds` PostgreSQL
- Prototype vector layer: `Qdrant Cloud`
- Cloud.gov-native fallback vector/search layer: `aws-elasticsearch` with `OpenSearch_2.11`
- Object storage: `S3` only if we need our own cached assets, exports, or generated files
- Background jobs: worker process in the same app suite

## Vector database answer

For the prototype, the best vector database choice is **Qdrant Cloud**.

Why:

- free tier is explicitly intended for testing and prototypes
- lower personal-card risk than tools with higher paid-plan minimums
- strong hybrid search and metadata filtering
- snapshots/restore support make migration practical
- open-source core reduces long-term lock-in
- it can stay external to `cloud.gov` via a user-provided service during prototyping

Cloud.gov path:

- Prototype now on `Qdrant Cloud`
- Bind it to the app from `cloud.gov` as an external service
- If stakeholders later require a marketplace-native service, re-index into `aws-elasticsearch` / OpenSearch
- If stakeholders want tighter control without rewriting the app, evaluate Qdrant's hybrid/private deployment options outside the `cloud.gov` app runtime

Secondary option:

- `aws-elasticsearch` / OpenSearch if we optimize for immediate `cloud.gov` alignment over prototype speed

Third option:

- PostgreSQL + `pgvector` if we intentionally collapse vector search into the relational store

Important caveat:

- AWS RDS docs list `pgvector` as supported on RDS PostgreSQL, but Cloud.gov docs do not explicitly guarantee `pgvector` on provisioned `aws-rds` instances
- treat that as a verification item, not an assumption

See also: `docs/vector-database-decision.md`

## Graph analysis recommendation

Do **not** start with a dedicated graph database.

The current graph is small enough that Phase 1-3 can use:

- semantic edge tables in Postgres
- OpenSearch documents for retrieval
- offline graph metric computation in a worker

Add a dedicated graph database only if usage patterns prove it is necessary.

## What I Can Execute Next

Recommended execution order:

1. Build Phase 1 first as a polished read-only investor demo.
2. Add the semantic sync/index pipeline and Phase 2 graph features.
3. Add user accounts, saved work, and alerts in Phase 3.
4. Add our own editorial CTA layer in Phase 4.
5. Wait for richer upstream reporting data before trying to mimic full Performance.gov behavior.

Concrete next build step:

- scaffold the app
- wire in live APEX endpoints
- ship the Strategy Explorer MVP

## Source URLs

- Aspirational product vision: https://github.com/GSA/US-performance-reporting/wiki/2.-Performance.gov
- Live APEX API root: https://apex.app.cloud.gov/api
- Live OpenAPI schema: https://apex.app.cloud.gov/api/openapi.json
- Live semantic manifest: https://apex.app.cloud.gov/api/semantic/manifest
- Live documents endpoint: https://apex.app.cloud.gov/api/documents
- Live measures endpoint: https://apex.app.cloud.gov/api/measures
- Cloud.gov services overview: https://docs.cloud.gov/platform/services/intro/
- Cloud.gov RDS: https://docs.cloud.gov/platform/services/relational-database/
- Cloud.gov OpenSearch/Elasticsearch service: https://docs.cloud.gov/platform/services/aws-elasticsearch/
- Qdrant pricing: https://qdrant.tech/pricing/
- Qdrant docs: https://qdrant.tech/documentation/
- AWS OpenSearch vector search: https://docs.aws.amazon.com/opensearch-service/latest/developerguide/vector-search.html
- AWS RDS PostgreSQL extensions: https://docs.aws.amazon.com/AmazonRDS/latest/PostgreSQLReleaseNotes/postgresql-extensions.html
