# Turborepo + Next.js + tRPC: Complete Architecture Guide (nonrml)

This document explains how Turborepo, Next.js, and tRPC work together in the **nonrml** monorepo — covering the theory, the actual implementation, and the key concepts behind each layer.

---

## Table of Contents

1. [What is a Monorepo and Why Use One?](#1-what-is-a-monorepo-and-why-use-one)
2. [Yarn Workspaces — The Foundation](#2-yarn-workspaces--the-foundation)
3. [Turborepo — The Orchestrator](#3-turborepo--the-orchestrator)
4. [Yarn vs Turbo — What Each Does](#4-yarn-vs-turbo--what-each-does)
5. [Next.js Apps in the Monorepo](#5-nextjs-apps-in-the-monorepo)
6. [tRPC — End-to-End Type-Safe APIs](#6-trpc--end-to-end-type-safe-apis)
7. [How tRPC Connection is Established (Step by Step)](#7-how-trpc-connection-is-established-step-by-step)
8. [The Full Request Lifecycle](#8-the-full-request-lifecycle)
9. [Workspace Dependency Graph](#9-workspace-dependency-graph)
10. [Key Concepts Reference](#10-key-concepts-reference)

---

## 1. What is a Monorepo and Why Use One?

A **monorepo** is a single Git repository that contains multiple projects (apps and packages) that can share code with each other.

**Without a monorepo**, if `admin-nonrml` and `client-main` both needed the same tRPC router or Prisma schema, you'd have to:
- Duplicate the code in both repos, OR
- Publish the shared code as an npm package, version it, and install it separately in each app

**With a monorepo**, shared code lives in `packages/` and is imported directly by any app or package that needs it — no publishing, no version mismatches, no duplication.

### nonrml monorepo structure:

```
nonrml/
├── apps/
│   ├── admin-nonrml/          # Admin panel (Next.js)
│   └── client-main/           # Customer storefront (Next.js)
├── packages/
│   ├── trpc/                  # Shared tRPC router + server (@nonrml/trpc)
│   ├── prisma/                # Shared Prisma client + schema (@nonrml/prisma)
│   ├── common/                # Shared utilities + constants (@nonrml/common)
│   ├── components/            # Shared React components (@nonrml/components)
│   ├── configs/               # Shared configs + NextAuth (@nonrml/configs)
│   ├── cache/                 # Redis/Upstash caching (@nonrml/cache)
│   ├── mailing/               # Email via Nodemailer (@nonrml/mailing)
│   ├── otp/                   # OTP generation/validation (@nonrml/otp)
│   ├── payment/               # Razorpay integration (@nonrml/payment)
│   ├── rate-limit/            # Rate limiting (@nonrml/rate-limit)
│   ├── shipping/              # Shipping logic (@nonrml/shipping)
│   ├── storage/               # S3/Supabase storage (@nonrml/storage)
│   ├── typescript-config/     # Shared tsconfig files (@nonrml/typescript-config)
│   └── eslint-config/         # Shared ESLint configs (@repo/eslint-config)
├── package.json               # Root: workspace definitions + turbo scripts
├── turbo.json                 # Turborepo pipeline configuration
└── .yarnrc.yml                # Yarn 4 configuration
```

---

## 2. Yarn Workspaces — The Foundation

### What Yarn Workspaces Does

Yarn Workspaces is a feature of Yarn that makes multiple `package.json` files in a single repo aware of each other. It is the **dependency management layer** of the monorepo.

### How It's Configured

In the root `package.json`:

```json
{
  "name": "nonrml",
  "private": true,
  "packageManager": "yarn@4.9.1",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

This tells Yarn: "Every folder inside `apps/` and `packages/` that has a `package.json` is a **workspace**."

### What Yarn Workspaces Does at Install Time

When you run `yarn install` at the root:

1. **Scans** all workspace directories (`apps/*`, `packages/*`)
2. **Resolves** dependencies across all workspaces
3. **Hoists** common dependencies to the root `node_modules/` (so you don't have 5 copies of React)
4. **Symlinks** local packages — when `client-main` depends on `@nonrml/trpc`, Yarn creates a symlink from `node_modules/@nonrml/trpc` → `packages/trpc/`

This symlinking is what lets you `import { appRouter } from "@nonrml/trpc"` and have it resolve to the local source code, not a published npm package.

### The `.yarnrc.yml` Configuration

```yaml
nodeLinker: node-modules
```

This tells Yarn 4 to use the traditional `node_modules/` folder structure instead of Yarn's newer Plug'n'Play (PnP) system. This is important for compatibility with Next.js and many other tools that expect `node_modules/` to exist.

### How Local Dependencies Are Declared

In `apps/client-main/package.json`:

```json
{
  "dependencies": {
    "@nonrml/trpc": "*",
    "@nonrml/common": "*",
    "@nonrml/cache": "*",
    "@nonrml/configs": "*"
  }
}
```

The `"*"` version means "use whatever version is in the workspace" — i.e., resolve to the local `packages/trpc` folder via symlink.

---

## 3. Turborepo — The Orchestrator

### What Turborepo Does

Turborepo is a **task runner** that understands the dependency graph between your workspaces. It does NOT install dependencies (that's Yarn's job). Instead, it:

1. **Runs tasks** (build, dev, lint, etc.) across all workspaces
2. **Respects dependency order** — if `@nonrml/trpc` depends on `@nonrml/prisma`, Turbo builds `prisma` first
3. **Parallelizes** independent work — if two packages don't depend on each other, their builds run simultaneously
4. **Caches** task outputs — if nothing changed in a package since last build, Turbo skips the build and serves the cached result

### The `turbo.json` Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "generate": {
      "cache": false
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "dependsOn": ["^start"]
    }
  }
}
```

### Breaking Down Each Task

#### `build`
```json
"build": {
  "dependsOn": ["^build"],
  "outputs": [".next/**", "!.next/cache/**"]
}
```
- **`dependsOn: ["^build"]`** — The `^` prefix means "build my dependencies first". If `client-main` depends on `@nonrml/trpc`, then `@nonrml/trpc`'s build runs before `client-main`'s build.
- **`outputs`** — Tells Turbo which files are produced by the build. Turbo caches these. Next time you build, if the inputs haven't changed, Turbo replays the cached output instead of building again.
- **`.next/**` but not `.next/cache/**`** — Cache the Next.js build output, but not Next.js's own internal cache (which is ephemeral).

#### `dev`
```json
"dev": {
  "cache": false,
  "persistent": true
}
```
- **`cache: false`** — Dev servers produce no cacheable output; they run continuously.
- **`persistent: true`** — Tells Turbo this task doesn't exit (it's a long-running dev server). Without this, Turbo would think the task "finished" and potentially kill it.
- When you run `turbo dev`, Turbo starts dev servers for ALL apps simultaneously.

#### `generate`
```json
"generate": {
  "cache": false
}
```
- Used for `prisma generate` — regenerates the Prisma client from the schema. Always runs fresh.

#### `lint`
```json
"lint": {
  "dependsOn": ["^lint"]
}
```
- Lint dependencies before linting dependents (catches issues bottom-up).

### How Turbo Caching Works

```
┌─────────────────────────────────────────────────────────┐
│                    turbo run build                       │
│                                                         │
│  1. Hash all inputs for each workspace:                 │
│     - Source files                                      │
│     - package.json                                      │
│     - .env files (globalDependencies)                   │
│     - tsconfig.json                                     │
│     - Hashes of dependency builds                       │
│                                                         │
│  2. Check cache for each workspace:                     │
│     ┌─────────────┐     ┌────────────────────────┐      │
│     │ Hash match?  │─Yes─│ Replay cached outputs   │     │
│     │             │      │ (.next/** restored)     │     │
│     └──────┬──────┘      └────────────────────────┘      │
│            │ No                                          │
│     ┌──────▼──────┐                                      │
│     │ Run build   │                                      │
│     │ Cache result │                                     │
│     └─────────────┘                                      │
└─────────────────────────────────────────────────────────┘
```

**First build**: Everything runs, outputs are cached.
**Second build (no changes)**: Everything is a cache HIT — build completes in seconds.
**After editing `packages/common/`**: Only `@nonrml/common` and everything that depends on it rebuilds. Unrelated packages serve cached results.

### Root Scripts (package.json)

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo dev",
    "start": "turbo start",
    "lint": "turbo lint",
    "prisma:generate": "cd packages/prisma && npx prisma generate"
  }
}
```

When you run `yarn dev` at the root:
1. Yarn sees the `dev` script
2. It executes `turbo dev`
3. Turbo looks at `turbo.json`, finds the `dev` task
4. Turbo discovers all workspaces with a `dev` script
5. Turbo runs them all in parallel (since `dev` has no `dependsOn: ["^dev"]`)
6. Both `admin-nonrml` and `client-main` start their Next.js dev servers

---

## 4. Yarn vs Turbo — What Each Does

This is a common source of confusion. They serve **completely different purposes**:

| Aspect | Yarn (Workspaces) | Turborepo |
|--------|-------------------|-----------|
| **Role** | Package manager + dependency resolver | Task runner + build orchestrator |
| **What it manages** | `node_modules`, dependencies, symlinks | Task execution, ordering, caching |
| **When you use it** | `yarn install`, `yarn add <pkg>` | `turbo run build`, `turbo dev` |
| **What it knows about** | Which packages exist, what they depend on (npm deps) | Which tasks to run, in what order, with what caching |
| **Could you use it alone?** | Yes, but you'd run builds manually per-workspace | No — Turbo needs a package manager to install deps |
| **Analogy** | The warehouse that stocks all the parts | The assembly line manager that orchestrates the build |

### The Division of Labor

```
yarn install
  └── Downloads all npm dependencies
  └── Creates node_modules/ at root (hoisted)
  └── Symlinks local workspace packages
  └── Now all imports resolve correctly

turbo run build
  └── Reads workspace dependency graph (from Yarn)
  └── Determines build order
  └── Runs builds in parallel where possible
  └── Caches outputs
  └── Skips unchanged packages
```

### Why Not Just Use Yarn Scripts?

You could run `yarn workspace client-main run build` — but:
- It won't automatically build `@nonrml/trpc` first
- It won't parallelize independent builds
- It won't cache anything
- You'd have to manually manage the build order

Turborepo does all of this automatically.

---

## 5. Next.js Apps in the Monorepo

### Two Apps, Shared Everything

Both `admin-nonrml` and `client-main` are Next.js 15 apps using the App Router. They share:
- The same tRPC router (`@nonrml/trpc`)
- The same Prisma schema and client (`@nonrml/prisma`)
- The same auth configuration (`@nonrml/configs`)
- The same UI components (`@nonrml/components`)
- The same utility functions (`@nonrml/common`)

But they have different:
- UI layouts and pages
- Feature sets (admin vs customer)
- Access control (admin procedures vs public/user procedures)

### How Next.js Resolves Workspace Imports

When `client-main` has this code:

```typescript
import { appRouter } from "@nonrml/trpc";
```

The resolution chain is:
1. Next.js (via webpack/turbopack) looks in `node_modules/@nonrml/trpc`
2. That's a **symlink** to `packages/trpc/` (created by Yarn)
3. The `package.json` in `packages/trpc/` has `"main": "src/index.ts"`
4. So the import resolves to `packages/trpc/src/index.ts`

This means **changes to packages are reflected immediately** in dev mode — no rebuild of the package needed.

### TypeScript Configuration Sharing

The root `tsconfig.json` extends from the shared config:

```json
{
  "extends": "@nonrml/typescript-config/base.json"
}
```

Each Next.js app extends the Next.js-specific config:

```json
// apps/client-main/tsconfig.json
{
  "extends": "@nonrml/typescript-config/nextjs.json"
}
```

The shared configs in `packages/typescript-config/` define:
- `base.json` — Strict TypeScript, ES2022 target
- `nextjs.json` — Extends base with Next.js settings (JSX, module resolution, plugins)
- `react-library.json` — For shared React component packages

---

## 6. tRPC — End-to-End Type-Safe APIs

### What tRPC Does

tRPC lets you write API endpoints on the server and call them from the client with **full TypeScript type safety** — without any code generation, OpenAPI schemas, or REST conventions. The types flow automatically from server to client.

```
Traditional REST:                          tRPC:

Server: app.get("/orders", handler)       Server: orders.getUserOrders = query(handler)
Client: fetch("/orders")                  Client: trpc.viewer.orders.getUserOrders.useQuery()
        ↑ no type info                            ↑ fully typed: input, output, errors
        ↑ have to manually type response          ↑ autocomplete works
        ↑ input validation is separate            ↑ input validated with same Zod schema
```

### Core tRPC Concepts

#### Router
A router groups related procedures (endpoints). Routers can be nested:

```typescript
// Root router
appRouter = router({
  viewer: viewerRouter,    // /viewer/*
})

// Viewer router nests sub-routers
viewerRouter = router({
  auth: authRouter,        // /viewer/auth/*
  orders: ordersRouter,    // /viewer/orders/*
  product: productRouter,  // /viewer/product/*
  // ... 16 more sub-routers
})
```

#### Procedure
A procedure is a single API endpoint. There are two types:
- **Query** — for reading data (like GET)
- **Mutation** — for writing/modifying data (like POST/PUT/DELETE)

```typescript
// Query example
getProducts: publicProcedure
  .input(ZGetProductsSchema)       // Zod validation
  .query(async ({ ctx, input }) => {
    return await getProducts({ ctx, input });
  })

// Mutation example
addProduct: adminProcedure
  .input(ZAddProductSchema)
  .mutation(async ({ ctx, input }) => {
    return await addProduct({ ctx, input });
  })
```

#### Context
The context is an object available to every procedure. It contains shared resources:

```typescript
type Context = {
  prisma: typeof prisma,      // Database client
  session?: session | null,   // Auth session (user ID + role)
  user?: User,                // Full user object (after middleware)
  req?: Request,
  res?: Response
}
```

#### Middleware
Middleware runs before a procedure and can modify the context or reject the request:

```typescript
// Auth middleware — checks session, fetches user, attaches to context
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  const user = await ctx.prisma.user.findFirst({
    where: { id: Number(ctx.session.user.id) }
  });
  return next({ ctx: { ...ctx, user } });
});

// Admin middleware — extends isAuthed, checks role
const isAdmin = isAuthed.unstable_pipe(async ({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
```

#### Procedure Types (Base Procedures)
Base procedures are pre-configured with middleware:

```typescript
publicProcedure       // No auth required
publicProtectedProcedure  // Requires logged-in user (isAuthed middleware)
adminProcedure        // Requires admin role (isAdmin middleware)
loginRestrictedProcedure  // Public but rate-limited (for login endpoints)
```

---

## 7. How tRPC Connection is Established (Step by Step)

This is the full chain from "code in packages/" to "working API call from the browser":

### Step 1: tRPC Server Initialization (`packages/trpc/src/server/trpc.ts`)

```typescript
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,   // Handles Date, Map, Set serialization
});

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
```

This creates the tRPC instance with:
- **Context type** — so all procedures know what's available in `ctx`
- **SuperJSON transformer** — automatically serializes/deserializes complex types (Dates, BigInts, etc.) that JSON can't handle

### Step 2: Context Factory (`packages/trpc/src/server/contexts/context.ts`)

```typescript
import prisma from "@nonrml/prisma";

export const createContext = ({ session, req, res }: CreateContextOptions): Context => {
  return { prisma, session, req, res };
};
```

This factory is called **per-request** — each API call gets a fresh context with:
- A Prisma client instance (shared singleton)
- The current user's session (from NextAuth)
- The raw request/response objects

### Step 3: Routers Are Built (`packages/trpc/src/server/routers/`)

```
_app.ts (root)
  └── viewer/_router.ts
        ├── auth/_router.ts          → sendOTP, verifyOTP
        ├── orders/_router.ts        → getUserOrders, initiateOrder, verifyOrder, cancelOrder, ...
        ├── product/_router.ts       → getProduct, getProducts, addProduct, editProduct, ...
        ├── address/_router.ts       → getAddresses, addAddress, editAddress, ...
        ├── payment/_router.ts       → updateFailedPaymentStatus
        ├── return/_router.ts        → initiateReturn, ...
        ├── creditNotes/_router.ts   → getCreditNote, sendCreditNoteOtp
        ├── user/_router.ts          → getUsers, changeRole, getUserContact
        ├── inventory/_router.ts     → ...
        ├── productVariant/_router.ts
        ├── productCategories/_router.ts
        ├── sizeChart/_router.ts
        ├── productImages/_router.ts
        ├── baseSkuInventory/_router.ts
        ├── homeImages/_router.ts
        ├── replacement/_router.ts
        └── vendorOrder/_router.ts
```

Each sub-router follows the pattern:
```
feature/
├── _router.ts           # Defines procedures (input + middleware + handler)
├── feature.schema.ts    # Zod schemas for input validation
└── feature.handler.ts   # Business logic
```

### Step 4: Everything is Exported (`packages/trpc/src/index.ts`)

```typescript
export { appRouter } from "./server/routers/_app";
export { createContext } from "./server/contexts/context";
export { createServerCaller } from "./server/trpc";
export type { AppRouter } from "./server/routers/_app";
```

The `AppRouter` type export is critical — it carries the complete type information of every procedure, input, and output.

### Step 5: Next.js API Route Handler (`apps/client-main/src/app/api/trpc/[trpc]/route.tsx`)

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@nonrml/trpc";
import { getSession } from "@nonrml/configs";

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createContext({
      req: req,
      session: await getSession(),
    }),
  });
};

export { handler as GET, handler as POST };
```

This is the **bridge** between HTTP and tRPC:
- Next.js catches any request to `/api/trpc/*` (the `[trpc]` dynamic segment)
- `fetchRequestHandler` parses the URL to determine which procedure to call
- It creates a fresh context with the current session
- It routes the request to the correct procedure
- It returns the result as an HTTP response

The `[trpc]` dynamic route segment captures the procedure path. A request to `/api/trpc/viewer.orders.getUserOrders` maps to `appRouter.viewer.orders.getUserOrders`.

### Step 6: tRPC React Client (`apps/client-main/src/app/_trpc/client.ts`)

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@nonrml/trpc";

export const trpc = createTRPCReact<AppRouter>();
```

This creates a type-safe React client. The `<AppRouter>` generic parameter gives the client full knowledge of every procedure, input type, and output type — this is how autocomplete and type checking works on the client.

### Step 7: Provider Setup (`apps/client-main/src/app/_trpc/provider.tsx`)

```typescript
export default function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: SuperJSON,          // Must match server's transformer
      links: [
        httpLink({
          url: "/api/trpc",            // Points to the Next.js API route
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",  // Send cookies (for NextAuth session)
            });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

Key configuration:
- **`url: "/api/trpc"`** — All tRPC calls go to this endpoint
- **`credentials: "include"`** — Sends cookies so the server can read the NextAuth session
- **`transformer: SuperJSON`** — Must match the server's transformer for serialization to work
- **React Query integration** — tRPC uses React Query under the hood for caching, refetching, and state management

### Step 8: Provider Hierarchy (`apps/client-main/src/app/provider.tsx`)

```typescript
export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <TRPCProvider>
      <SessionProvider>
        <RecoilRoot>
          {children}
        </RecoilRoot>
      </SessionProvider>
    </TRPCProvider>
  );
};
```

TRPCProvider wraps everything — this makes `trpc` hooks available in all components.

### Step 9: Usage in Components

```typescript
// Query — fetches data
const userOrders = trpc.viewer.orders.getUserOrders.useQuery(undefined, {
  staleTime: Infinity,
  refetchOnWindowFocus: false,
});
// userOrders.data is fully typed!

// Mutation — modifies data
const cancelOrder = trpc.viewer.orders.cancelOrder.useMutation({
  onSuccess: () => userOrders.refetch(),
});
await cancelOrder.mutateAsync({ orderId: 123 });
// Input is type-checked against the Zod schema!
```

### Step 10: Server-Side Calls (`apps/client-main/src/app/_trpc/serverClient.ts`)

For Server Components and server-side data fetching:

```typescript
import { createServerCaller } from "@nonrml/trpc";
import { getSession } from "@nonrml/configs";

export const serverClient = async () => createServerCaller(await getSession());
```

This creates a **direct caller** — it invokes procedures directly on the server without going through HTTP. Used in:
- Server Components (RSC)
- Server Actions
- API route handlers

```typescript
// In a Server Component
const server = await serverClient();
const products = await server.viewer.product.getProducts({ ... });
```

---

## 8. The Full Request Lifecycle

Here's what happens when a user clicks "Cancel Order" in the browser:

```
Browser (React Component)
│
│  cancelOrder.mutateAsync({ orderId: 123, reason: "Changed mind" })
│
▼
tRPC React Client
│  - Serializes input with SuperJSON
│  - Constructs URL: POST /api/trpc/viewer.orders.cancelOrder
│  - Attaches cookies (credentials: "include")
│
▼
HTTP Request → Next.js Server
│  - Hits /app/api/trpc/[trpc]/route.tsx
│  - [trpc] segment = "viewer.orders.cancelOrder"
│
▼
fetchRequestHandler
│  - Calls createContext() → { prisma, session: { user: { id: "42", role: "USER" } } }
│  - Parses procedure path: viewer → orders → cancelOrder
│  - Deserializes input with SuperJSON
│
▼
Procedure Pipeline
│  1. Input Validation (Zod schema)
│     - Validates { orderId: number, reason: string }
│     - Throws BAD_REQUEST if invalid
│
│  2. Middleware: isAuthed
│     - Checks ctx.session exists
│     - Fetches user from DB: prisma.user.findFirst({ id: 42 })
│     - Attaches user to context
│
│  3. Handler: cancelOrder()
│     - Business logic runs
│     - Uses ctx.prisma to update the order
│     - Returns { status: "SUCCESS", data: { ... } }
│
▼
Response
│  - Serialized with SuperJSON
│  - Sent as HTTP response
│
▼
tRPC React Client
│  - Deserializes response
│  - Updates React Query cache
│  - Triggers onSuccess callback → refetches userOrders
│
▼
UI Updates
   - Order list re-renders with updated data
```

---

## 9. Workspace Dependency Graph

```
                    ┌─────────────────┐     ┌──────────────────┐
                    │  admin-nonrml   │     │   client-main    │
                    │  (Next.js App)  │     │  (Next.js App)   │
                    └────────┬────────┘     └────────┬─────────┘
                             │                       │
              ┌──────────────┼───────────────────────┼──────────────┐
              │              │                       │              │
              ▼              ▼                       ▼              ▼
      ┌───────────┐  ┌─────────────┐        ┌────────────┐  ┌──────────┐
      │ components│  │   configs   │        │   cache    │  │ shipping │
      └─────┬─────┘  └──────┬──────┘        └─────┬──────┘  └──────────┘
            │                │                     │
            │         ┌──────┴──────┐              │
            │         │   prisma    │              │
            │         └──────┬──────┘              │
            │                │                     │
            ▼                ▼                     ▼
        ┌────────────────────────────────────────────────┐
        │                 @nonrml/trpc                   │
        │         (Central API Hub Package)              │
        │                                                │
        │  Depends on: common, prisma, configs, cache,   │
        │  mailing, otp, payment, rate-limit, shipping,  │
        │  storage                                       │
        └────────────────────┬───────────────────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │  @nonrml/   │
                      │   common    │
                      │ (foundation)│
                      └─────────────┘
```

**`@nonrml/trpc`** is the central hub — it imports all feature packages and exposes them as a unified API surface. Both apps consume this single package for all their API needs.

**`@nonrml/common`** is the foundation — almost everything depends on it for shared types, utilities, and constants.

---

## 10. Key Concepts Reference

### Turborepo Concepts

| Concept | Explanation |
|---------|-------------|
| **Task** | A named operation (build, dev, lint) defined in `turbo.json` |
| **Pipeline** | The set of all tasks and their dependency relationships |
| **`^` prefix** | Means "run this task in my dependencies first" (topological) |
| **`dependsOn`** | Declares task ordering — prevents race conditions |
| **`outputs`** | Files produced by a task — these get cached |
| **`persistent`** | Marks a task as long-running (dev servers) |
| **`cache: false`** | Disables caching for tasks that must always run fresh |
| **`globalDependencies`** | Files that, when changed, invalidate ALL caches (`.env` files) |
| **Content Hash** | Turbo hashes inputs to determine if a task needs re-running |
| **Remote Caching** | Share build caches across team members via Vercel (not configured here) |

### tRPC Concepts

| Concept | Explanation |
|---------|-------------|
| **Router** | Groups related procedures; can be nested |
| **Procedure** | A single API endpoint (query or mutation) |
| **Query** | Read-only procedure (uses HTTP GET under the hood) |
| **Mutation** | Write procedure (uses HTTP POST under the hood) |
| **Context** | Per-request object shared by all procedures (prisma, session, etc.) |
| **Middleware** | Runs before a procedure; can modify context or reject request |
| **Input** | Zod schema that validates procedure arguments |
| **Transformer** | Serializer (SuperJSON) that handles types JSON can't (Date, Map, etc.) |
| **Link** | Transport layer config — `httpLink` sends requests via fetch |
| **Caller** | Server-side direct procedure invocation (no HTTP round-trip) |
| **`AppRouter` type** | The TypeScript type exported from server, imported by client for type safety |
| **React Query** | tRPC uses React Query internally for client-side caching and state |

### Yarn Workspace Concepts

| Concept | Explanation |
|---------|-------------|
| **Workspace** | A package within the monorepo (each has its own `package.json`) |
| **Hoisting** | Moving shared dependencies to root `node_modules/` to avoid duplication |
| **Symlinking** | Local workspace packages are symlinked, not copied |
| **`"*"` version** | "Resolve to the local workspace version" |
| **`nodeLinker: node-modules`** | Use traditional `node_modules/` instead of Plug'n'Play |

### How They All Fit Together

```
┌──────────────────────────────────────────────────────────────┐
│                         MONOREPO                             │
│                                                              │
│  ┌─────────────────┐                                         │
│  │  Yarn Workspaces │  "I manage dependencies & symlinks"    │
│  │  (Foundation)    │  yarn install → node_modules/ ready    │
│  └────────┬────────┘                                         │
│           │                                                  │
│  ┌────────▼────────┐                                         │
│  │    Turborepo    │  "I orchestrate tasks across packages"  │
│  │  (Orchestrator)  │  turbo dev → all apps start in order   │
│  └────────┬────────┘  turbo build → parallel + cached        │
│           │                                                  │
│  ┌────────▼────────────────────────────────────────────┐     │
│  │  Workspace Packages                                 │     │
│  │                                                     │     │
│  │  @nonrml/prisma ─── Database schema + client        │     │
│  │       ↓                                             │     │
│  │  @nonrml/trpc ───── API layer (routers + handlers)  │     │
│  │       ↓                                             │     │
│  │  Next.js Apps ───── UI + API route + tRPC client    │     │
│  │                                                     │     │
│  │  The tRPC package bridges server logic to client    │     │
│  │  type safety — both apps share the same router.     │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Common Commands

```bash
# Install all dependencies across all workspaces
yarn install

# Start all dev servers (admin + client)
yarn dev          # or: turbo dev

# Build all packages and apps (respects dependency order)
yarn build        # or: turbo run build

# Generate Prisma client after schema changes
yarn prisma:generate

# Lint everything
yarn lint

# Add a dependency to a specific workspace
yarn workspace client-main add <package-name>

# Run a script in a specific workspace
yarn workspace @nonrml/trpc run build

# Run a turbo task for a specific app only
turbo run build --filter=client-main

# Run a turbo task for an app and all its dependencies
turbo run build --filter=client-main...
```

---

## Summary

| Layer | Tool | Purpose in nonrml |
|-------|------|-------------------|
| **Package Management** | Yarn 4 + Workspaces | Installs deps, symlinks local packages, hoists shared deps |
| **Task Orchestration** | Turborepo | Runs build/dev/lint in correct order, parallelizes, caches |
| **API Layer** | tRPC | Type-safe RPC between Next.js frontend and server logic |
| **Database** | Prisma | Schema, migrations, type-safe DB queries |
| **Auth** | NextAuth | Session management, JWT, credential-based login |
| **Validation** | Zod | Input validation for tRPC procedures (shared server+client) |
| **State Management** | React Query (via tRPC) | Client-side caching, refetching, loading states |
| **Serialization** | SuperJSON | Handles Date, BigInt, Map etc. across the wire |