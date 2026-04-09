# NAP Solutions — AI Email Platform Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │Dashboard │ │Campaign  │ │Brand     │ │Email Editor      │   │
│  │Home      │ │List/CRUD │ │Settings  │ │(Dual-pane + AI)  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬──────────┘   │
│       │             │            │                │              │
│       └─────────────┴────────────┴────────────────┘              │
│                           │                                      │
│                    Next.js App Router                             │
│                    (Middleware: Auth Guard)                        │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTP / Server Actions
┌───────────────────────────┴──────────────────────────────────────┐
│                      API LAYER (Next.js Routes)                   │
│                                                                   │
│  /api/auth/*          NextAuth.js (JWT sessions)                 │
│  /api/ai/generate     Claude email generation                     │
│  /api/ai/refine       Claude partial edits                        │
│  /api/ai/subjects     Claude subject line suggestions             │
│  /api/campaigns/*     CRUD + send + schedule                     │
│  /api/contacts/*      CRUD + CSV import                          │
│  /api/brand/*         Brand profile CRUD                         │
│  /api/track/*         Open/click tracking pixels                 │
│  /api/health          Health check                                │
│                                                                   │
│  Middleware: auth validation, rate limiting, zod validation       │
└──────┬───────────────┬──────────────────┬────────────────────────┘
       │               │                  │
       ▼               ▼                  ▼
┌──────────┐   ┌──────────────┐   ┌──────────────┐
│PostgreSQL│   │ Claude API   │   │  Resend API  │
│(Prisma)  │   │ (Anthropic)  │   │  (Email)     │
│          │   │              │   │              │
│ Users    │   │ Generate     │   │ Send emails  │
│ Campaigns│   │ Refine       │   │ Track events │
│ Contacts │   │ Suggest      │   │              │
│ Templates│   │              │   │              │
│ Events   │   │              │   │              │
│ Brands   │   │              │   │              │
└──────────┘   └──────────────┘   └──────────────┘
```

## Data Flow: AI Email Generation

```
User fills campaign brief
        │
        ▼
┌─────────────────┐
│ Fetch brand     │
│ profile from DB │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Construct prompt│
│ brief + brand   │
│ + system prompt │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST to Claude  │
│ API (streaming) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sanitize HTML   │
│ (DOMPurify)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Return to client│
│ Render in iframe│
│ Store as draft  │
└─────────────────┘
```

## Data Flow: Email Sending

```
User clicks "Send" or schedule triggers
        │
        ▼
┌─────────────────────┐
│ Validate campaign   │
│ (status, HTML, list)│
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Fetch contacts from │
│ selected list       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ For each contact:   │
│ - Inject tracking   │
│   pixel             │
│ - Wrap links for    │
│   click tracking    │
│ - Send via Resend   │
│ - Log EmailEvent    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Update campaign     │
│ status → "sent"     │
└─────────────────────┘
```

## Technology Decisions

| Layer       | Choice            | Rationale                                         |
|-------------|-------------------|---------------------------------------------------|
| Framework   | Next.js 14        | App Router, server components, API routes in one   |
| Language    | TypeScript        | Type safety across full stack                      |
| Styling     | Tailwind + shadcn | Rapid UI development with consistent design system |
| ORM         | Prisma            | Type-safe DB access, migrations, seeding           |
| AI          | Claude Sonnet     | Best balance of quality and speed for generation   |
| Email       | Resend            | Modern API, great DX, reliable delivery            |
| Auth        | NextAuth.js       | Battle-tested, JWT sessions, middleware support     |
| Hosting     | Vercel            | Zero-config Next.js deploys, edge functions, cron  |
