# ngetag-web — Architecture & Product Change Guide

> Living documentation for the application architecture, customer/owner journeys, and safe feature delivery. The diagrams reflect the current repository layout (`app/`, `src/`, and `src/db/`); update them when routes, data ownership, or key workflows change. Database source of truth: `src/db/schema.ts`, `src/db/auth.schema.ts`, `src/db/telemetry.schema.ts`, and `src/db/relations.ts`.

## 1. High-level component architecture

```mermaid
flowchart TB
  subgraph Browser[Browser / PWA]
    UI[Next.js App Router pages]
    FE[Feature components and hooks]
    STATE[Providers: auth, location, theme, telemetry]
    UI --> FE
    UI --> STATE
    FE --> CLIENT[API client and browser storage]
  end
  subgraph Next[Next.js application]
    ROUTES[App Router pages and layouts]
    API[Route handlers: app/api]
    AUTH[Auth services, guards, JWT/session]
    SCHEMA[Zod request/response schemas]
    REPO[Data repositories]
    STORE[Server store / fixture-backed domain data]
    TELEMETRY[Telemetry and recommendation services]
    DOCS[OpenAPI and API docs]
    ROUTES --> FE
    API --> AUTH
    API --> SCHEMA
    API --> REPO
    API --> TELEMETRY
    API --> DOCS
    REPO --> STORE
  end
  subgraph Persistence[Persistence / integrations]
    PG[(PostgreSQL + Drizzle)]
    FIX[In-memory / fixture repositories]
    OAUTH[OAuth providers]
    GEO[Geocoding and location services]
  end
  CLIENT -->|HTTP same-origin /api| API
  AUTH --> PG
  STORE --> PG
  STORE -. fallback or development .-> FIX
  AUTH --> OAUTH
  FE --> GEO
  TELEMETRY --> PG
```

The project has both PostgreSQL/Drizzle schema and fixture/in-memory repository paths. Do not assume every endpoint persists to PostgreSQL: inspect the route's repository/service implementation before changing persistence semantics.

## 2. Site map

```mermaid
mindmap
  root((ngetag-web))
    Discover
      Home
      Explore
      Search
      Location picker
      Tags
      Spot detail
      Event detail
      Promotions
      Hype feed
      Theme gallery
    Community
      Community directory
      Community detail
      Updates and agendas
    Personal
      Account
      Profile
      My reviews
      Bookmarks
      Calendar and attendance
      Notifications
      QR scan and visit
    Editorial
      Blog listing
      Blog article
    Identity
      Login
      Signup
      OAuth callback
    Platform
      API documentation
      API health and schema
      Telemetry
    Owner and business APIs
      Owner management
      Spot and event management
      Gallery assets and QR codes
      B2B analytics and handoff
```

Site map describes user-facing pages plus major platform/API areas. Route files live under `app/`; dynamic pages use `[id]` or `[slug]` segments.

## 3. Database ER diagram

The ERD below captures the primary domain and explicit foreign-key relationships. Some polymorphic references (for example `bookmarks.targetType/targetId`, gallery ownership, QR targets) cannot be expressed as ordinary foreign keys and are labeled accordingly. Auth and telemetry tables are shown as logical supporting groups; consult their schema files for all columns and constraints.

```mermaid
erDiagram
  OWNERS ||--o{ SPOTS : owns
  OWNERS ||--o{ EVENTS : owns
  OWNERS ||--o{ COMMUNITIES : manages
  OWNERS ||--o{ PROMOS : creates
  SPOTS ||--o{ SPOT_OPENING_HOURS : has
  SPOTS ||--o{ SPOT_TAGS : classified_by
  TAGS ||--o{ SPOT_TAGS : labels
  EVENTS ||--o{ EVENT_TAGS : classified_by
  TAGS ||--o{ EVENT_TAGS : labels
  EVENTS ||--o{ EVENT_INTERESTS : matches
  INTERESTS ||--o{ EVENT_INTERESTS : categorizes
  CUSTOMERS ||--o{ CUSTOMER_INTERESTS : selects
  INTERESTS ||--o{ CUSTOMER_INTERESTS : chosen_by
  CUSTOMERS ||--o{ CUSTOMER_FAVORITE_TAGS : selects
  TAGS ||--o{ CUSTOMER_FAVORITE_TAGS : favorited_by
  SPOTS ||--o{ REVIEWS : receives
  SPOTS ||--o{ REVIEW_TAGS : offers
  REVIEWS ||--o{ REVIEW_SELECTED_TAGS : tagged_with
  REVIEW_TAGS ||--o{ REVIEW_SELECTED_TAGS : selected
  SPOTS ||--o{ PROMOS : promotes
  EVENTS ||--o{ PROMOS : promotes
  COMMUNITY_CATEGORIES ||--o{ COMMUNITIES : groups
  COMMUNITIES ||--o{ COMMUNITY_UPDATES : publishes
  COMMUNITIES ||--o{ COMMUNITY_AGENDAS : schedules
  CUSTOMERS ||--o{ BOOKMARKS : saves
  CUSTOMERS ||--o{ EVENT_ATTENDANCES : schedules
  EVENTS ||--o{ EVENT_ATTENDANCES : attended_by
  CUSTOMERS ||--o{ SPOT_VISITS : records
  SPOTS ||--o{ SPOT_VISITS : visited
  CUSTOMERS ||--o{ COMMUNITY_MEMBERSHIPS : joins
  COMMUNITIES ||--o{ COMMUNITY_MEMBERSHIPS : has_members
  OWNERS ||--o{ OWNER_SPOTS : assigned
  SPOTS ||--o{ OWNER_SPOTS : assigned
  OWNERS ||--o{ OWNER_EVENTS : assigned
  EVENTS ||--o{ OWNER_EVENTS : assigned
  OWNERS ||--o{ OWNER_COMMUNITIES : assigned
  COMMUNITIES ||--o{ OWNER_COMMUNITIES : assigned
  OWNERS ||--o{ QR_CODES : administers
  EVENTS ||--o{ HYPE_ITEMS : featured_in

  OWNERS { varchar id PK }
  CUSTOMERS { varchar id PK }
  TAGS { varchar id PK }
  INTERESTS { varchar id PK }
  SPOTS { varchar id PK
    varchar owner_id FK
  }
  SPOT_OPENING_HOURS { varchar spot_id PK,FK
    enum day PK
  }
  EVENTS { varchar id PK
    varchar owner_id FK
  }
  PROMOS { varchar id PK
    varchar owner_id FK
    varchar spot_id FK
    varchar event_id FK
  }
  REVIEWS { varchar id PK
    varchar spot_id FK
  }
  REVIEW_TAGS { varchar id PK
    varchar spot_id FK
  }
  REVIEW_SELECTED_TAGS { varchar review_id PK,FK
    varchar review_tag_id PK,FK
  }
  COMMUNITY_CATEGORIES { varchar id PK }
  COMMUNITIES { varchar id PK
    varchar owner_id FK
    varchar category_id FK
  }
  COMMUNITY_UPDATES { varchar id PK
    varchar community_id FK
  }
  COMMUNITY_AGENDAS { varchar id PK
    varchar community_id FK
  }
  SPOT_TAGS { varchar spot_id PK,FK
    varchar tag_id PK,FK
  }
  EVENT_TAGS { varchar event_id PK,FK
    varchar tag_id PK,FK
  }
  EVENT_INTERESTS { varchar event_id PK,FK
    varchar interest_id PK,FK
  }
  CUSTOMER_INTERESTS { varchar customer_id PK,FK
    varchar interest_id PK,FK
  }
  CUSTOMER_FAVORITE_TAGS { varchar customer_id PK,FK
    varchar tag_id PK,FK
  }
  OWNER_SPOTS { varchar owner_id PK,FK
    varchar spot_id PK,FK
  }
  OWNER_EVENTS { varchar owner_id PK,FK
    varchar event_id PK,FK
  }
  OWNER_COMMUNITIES { varchar owner_id PK,FK
    varchar community_id PK,FK
  }
  BOOKMARKS { varchar id PK
    varchar customer_id FK
    varchar target_id "polymorphic id"
    enum target_type "spot or event"
  }
  EVENT_ATTENDANCES { varchar id PK
    varchar customer_id FK
    varchar event_id FK
  }
  SPOT_VISITS { varchar id PK
    varchar customer_id FK
    varchar spot_id FK
  }
  COMMUNITY_MEMBERSHIPS { varchar id PK
    varchar customer_id FK
    varchar community_id FK
  }
  QR_CODES { varchar id PK
    varchar owner_id FK
    varchar target_id "polymorphic id"
  }
  HYPE_ITEMS { varchar id PK
    varchar event_id FK
  }
  GALLERY_ASSETS { varchar id PK
    varchar owner_id "polymorphic owner"
  }
  BLOGS { varchar id PK }
  NOTIFICATIONS { varchar id PK
    varchar customer_id FK
  }
```

Additional authentication tables (accounts, sessions, credentials/tokens) are defined in `src/db/auth.schema.ts`; event telemetry, taste vectors, and content embeddings are in `src/db/telemetry.schema.ts`. The diagram intentionally focuses on the product domain rather than reproducing every column/index. Verify optional customer foreign keys and polymorphic relations directly in schema before writing migrations.

## 4. Use-case sequence diagrams

These diagrams cover the primary user journeys exposed by the UI and API. Request validation, auth checks, and persistence vary per endpoint; branches are illustrative and should be checked against current handlers before implementation.
```mermaid
sequenceDiagram
  actor Visitor
  actor Customer
  actor Merchant
  participant UI as ngeTag<br/>[Web PWA UI]
  participant API as Next.js API
  participant Auth as API[Auth]
  participant Svc as API[Services]
  participant Reco as API[Recomendation]
  participant DBR as PG-DB[Content/Repository]
  participant DBS as PG-DB[User/Session]

  Visitor->>UI: Search, filter, choose location
  UI->>API: GET /api/search or /api/spots, /events
  API->>Svc: validate query and rank/filter
  Svc->>DBR: read content, tags, interests, geo data
  DBR-->>Svc: matching content
  Svc-->>API: results
  API-->>UI: JSON response
  UI-->>Visitor: Results and detail links
  rect rgb(191, 223, 255)
  Visitor->>UI: Open article, community, or notifications
  UI->>API: GET /api/blogs, /communities, /notifications
  API->>Svc: validate and load requested resource
  Svc->>DBR: read content and user state
  DBR-->>UI: response data
  opt Join, updates, agendas, or notification read state
    Visitor->>UI: Change engagement/state
    UI->>API: POST/PATCH relevant endpoint
    API->>Svc: authorize and apply action
    Svc->>DBR: save update
    DBR-->>UI: updated state
  end
  opt Telemetry consent granted
    UI->>API: POST /api/telemetry/events or /profile
    API->>Svc: record/analyze activity
    Svc->>DBR: persist event/profile or update recommendation index
    DBR-->>API: accepted
  end
  end
  Customer->>UI: Sign up or enter credentials
  UI->>API: POST /api/auth/signup or /login
  API->>Auth: validate and authenticate
  Auth->>DBS: create/find user and session
  DBS-->>Auth: account/session
  Auth-->>API: tokens/cookie and profile
  API-->>UI: success or validation/auth error
  UI-->>Customer: Signed-in state
  rect rgb(191, 223, 255)
  Customer->>UI: View/update profile or sessions
  UI->>API: GET/PATCH /api/users/me, /api/auth/profile or sessions
  API->>Auth: authorize and apply change
  Auth->>DBS: persist change
  DBS-->>API: updated state
  API->>Reco: get recomendation for profile
  Reco-->>API: reco data
  API-->>UI: profile and reco response
  UI-->>Customer: Results and update reco
  end
  Merchant->>UI: Create or update spot/event/promo/community
  UI->>API: POST/PATCH /api/{resource}
  API->>Auth: validate request and owner permissions
  Auth->>DBS: persist content and relationships
  DBS-->>API: saved content
  API-->>UI: result
  UI-->>Merchant: result
  rect rgb(191, 223, 255)
  Merchant->>UI: Request analytics or dataset handoff
  UI->>API: GET /api/b2b/analytics or /handoff
  API->>Auth: authorize owner operation
  Auth->>DBR: aggregate or snapshot domain data
  DBR-->>UI: metrics / handoff payload
  UI-->Merchant: result
  end

```

### Discover, search, and recommendations
```mermaid
sequenceDiagram
  actor Visitor
  participant UI as Search/Explore UI
  participant API as Next.js API
  participant S as Search/Recommendation service
  participant R as Repository / DB
  Visitor->>UI: Search, filter, choose location
  UI->>API: GET /api/search or /api/spots, /events
  API->>S: validate query and rank/filter
  S->>R: read content, tags, interests, geo data
  R-->>S: matching content
  S-->>API: results
  API-->>UI: JSON response
  UI-->>Visitor: Results and detail links
```

### Account creation, login, session and profile
```mermaid
sequenceDiagram
  actor User
  participant UI as Auth/Profile UI
  participant API as Auth API
  participant Auth as Auth service
  participant DB as PostgreSQL/session store
  User->>UI: Sign up or enter credentials
  UI->>API: POST /api/auth/signup or /login
  API->>Auth: validate and authenticate
  Auth->>DB: create/find user and session
  DB-->>Auth: account/session
  Auth-->>API: tokens/cookie and profile
  API-->>UI: success or validation/auth error
  UI-->>User: Signed-in state
  User->>UI: View/update profile or sessions
  UI->>API: GET/PATCH /api/users/me, /api/auth/profile or sessions
  API->>Auth: authorize and apply change
  Auth->>DB: persist change
  DB-->>API: updated state
  API-->>UI: response
```

### OAuth sign-in
```mermaid
sequenceDiagram
  actor User
  participant UI as OAuth UI
  participant API as OAuth route
  participant Provider as OAuth provider
  participant Auth as Auth service
  User->>UI: Choose provider
  UI->>API: GET /api/auth/oauth/{provider}
  API-->>UI: Redirect to provider
  UI->>Provider: Authenticate and consent
  Provider-->>UI: Redirect with authorization code
  UI->>API: GET /api/auth/oauth/{provider}/callback
  API->>Provider: Exchange code / verify identity
  Provider-->>API: Verified identity
  API->>Auth: Find or create account and session
  Auth-->>UI: Session result / callback redirect
```

### Spot review, QR visit, and helpful vote
```mermaid
sequenceDiagram
  actor Customer
  participant UI as Spot/Review UI
  participant API as Review/Engagement API
  participant Auth as Auth and validation
  participant Store as Repository / DB
  Customer->>UI: Open spot, view reviews
  UI->>API: GET /api/spots/{id}/reviews
  API->>Store: load reviews and tags
  Store-->>UI: reviews
  Customer->>UI: Scan spot QR / submit review
  UI->>API: POST /api/engagements/visits or /api/reviews
  API->>Auth: validate payload and permission
  Auth->>Store: record verified visit / review / selected tags
  Store-->>API: saved result
  API-->>UI: success or error
  opt Helpful vote
    Customer->>UI: Mark review helpful
    UI->>API: POST /api/reviews/{id}/helpful
    API->>Store: increment helpful count
    Store-->>UI: updated review
  end
```

### Bookmark, event attendance, community membership
```mermaid
sequenceDiagram
  actor Customer
  participant UI as Discovery/Calendar UI
  participant API as Engagement API
  participant Auth as Auth guard
  participant DB as Repository / DB
  Customer->>UI: Save spot/event or join community
  UI->>API: POST /api/engagements/bookmarks or memberships
  API->>Auth: authenticate and validate target
  Auth->>DB: toggle bookmark or membership
  DB-->>UI: updated state
  Customer->>UI: Add event to calendar
  UI->>API: POST /api/engagements/attendances
  API->>Auth: authenticate and validate event
  Auth->>DB: toggle attendance
  DB-->>UI: attendance state
  UI-->>Customer: Updated saved, member, and calendar views
```

### Owner content management and business analytics
```mermaid
sequenceDiagram
  actor Owner
  participant UI as Owner client / handoff consumer
  participant API as B2B API
  participant Auth as Authorization and validation
  participant Repo as Repository / DB
  Owner->>UI: Create or update spot/event/promo/community
  UI->>API: POST/PATCH /api/{resource}
  API->>Auth: validate request and owner permissions
  Auth->>Repo: persist content and relationships
  Repo-->>API: saved content
  API-->>UI: result
  Owner->>UI: Request analytics or dataset handoff
  UI->>API: GET /api/b2b/analytics or /handoff
  API->>Auth: authorize owner operation
  Auth->>Repo: aggregate or snapshot domain data
  Repo-->>UI: metrics / handoff payload
```

### Editorial, communities, notifications, and telemetry
```mermaid
sequenceDiagram
  actor Visitor
  participant UI as Blog/Community/Notification UI
  participant API as Content and telemetry APIs
  participant Service as Domain service
  participant DB as Repository / DB
  Visitor->>UI: Open article, community, or notifications
  UI->>API: GET /api/blogs, /communities, /notifications
  API->>Service: validate and load requested resource
  Service->>DB: read content and user state
  DB-->>UI: response data
  opt Join, updates, agendas, or notification read state
    Visitor->>UI: Change engagement/state
    UI->>API: POST/PATCH relevant endpoint
    API->>Service: authorize and apply action
    Service->>DB: save update
    DB-->>UI: updated state
  end
  opt Telemetry consent granted
    UI->>API: POST /api/telemetry/events or /profile
    API->>Service: record/analyze activity
    Service->>DB: persist event/profile or update recommendation index
    DB-->>API: accepted
  end
```

## 5. Maintaining existing features

- **Establish behavior first:** identify the route/page, feature component, API handler, repository/service, schema, and tests/docs involved. Read related contracts and current user-facing behavior before editing.
- **Preserve contracts:** keep existing URLs, HTTP methods, payload shapes, response envelopes, query semantics, auth requirements, and error behavior backward-compatible unless the Product Owner explicitly approves a breaking change. Update OpenAPI/docs when a contract changes.
- **Keep boundaries:** pages compose `src/features/*`; shared UI belongs in `src/components/*`; API handlers validate with `src/schemas/*` and delegate domain work rather than embedding business logic. Reuse the API client, auth guards, and repository patterns.
- **Protect data:** schema changes require deliberate Drizzle updates and migration/deployment consideration. Check `src/db/relations.ts`, seed data, fixtures, and both PostgreSQL and fallback repository paths. Avoid destructive or implicit data transformations.
- **Test regression paths:** cover success, empty state, invalid input, unauthenticated/unauthorized access, and relevant failure states. Run `npm run lint`, `npx tsc --noEmit`, and targeted tests (where present); run build for broad or routing changes. Check mobile/PWA behavior and accessibility for UI changes.
- **Keep documentation aligned:** update this file, API/schema docs, and route/feature documentation as needed. Note intentional deviations or known limitations.

## 6. Adding a feature from a Product Owner change request

1. **Capture the request:** record problem statement, target users, business outcome, scope and non-goals, acceptance criteria, priority, analytics needs, and release constraints. Resolve ambiguity with the PO before implementation.
2. **Assess impact:** map the request to existing pages/use cases, API contracts, auth/roles, data model, integrations, privacy/security, accessibility, and operational/deployment impacts. Identify compatibility risks and migration/backfill/rollback needs.
3. **Propose design:** describe UI states, endpoint/payload changes, schema/relationship changes, failure handling, telemetry, and test plan. For behavior or contract changes, obtain PO approval of acceptance criteria and API/data approach before coding.
4. **Implement in the established layers:** add or update route and feature modules, schemas/contracts, domain service/repository, persistence and UI. Prefer small additive changes; use a feature flag where rollout risk warrants it. Never bypass authorization or validation to meet a UI-only requirement.
5. **Verify:** add automated tests for acceptance criteria and regression cases; run lint, typecheck, and relevant build/checks. Validate migrations against representative existing data and verify rollback strategy for production data changes.
6. **Review and release:** provide a concise change summary, test evidence, migration/deployment steps, risks, and rollback plan for review. Obtain required code and PO acceptance, deploy through the normal release process, monitor errors/usage, and close the request only after acceptance criteria are met.
7. **Maintain the record:** update diagrams, API/schema docs, release notes, and operational guidance. Record follow-up work rather than silently expanding scope.
