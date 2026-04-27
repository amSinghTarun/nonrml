# NoNRML Monorepo — Architecture Deep Dive

This document captures a deep walkthrough of the NoNRML codebase: how the Turborepo is wired, how the shared packages fit together, how tRPC is plugged into Next.js end-to-end, and the non-obvious technical details worth knowing before touching anything load-bearing.

The document is structured around four questions asked in sequence. Each section keeps the original question verbatim and expands on the original answer with additional detail and file references.

---

## Question 1

> **"Index the code and understand how everything works in depth. How turborepo connects to next app, how does packages work and everything."**

### 1.1 Repository shape

```
nonrml/
├── apps/
│   ├── admin-nonrml/         Next.js 15 backoffice (port 3001)
│   └── client-main/          Next.js 15 storefront (port 8080)
├── packages/
│   ├── cache/                Upstash Redis client + JSON helpers
│   ├── common/               Helpers, types, transactional email HTML
│   ├── components/           Shared React components
│   ├── configs/              NextAuth config + session helpers
│   ├── eslint-config/        Shared ESLint presets
│   ├── mailing/              ZeptoMail SMTP wrapper
│   ├── otp/                  Fast2SMS OTP wrapper
│   ├── payment/              Razorpay SDK wrapper + webhook verify
│   ├── prisma/               schema.prisma + singleton Prisma client
│   ├── rate-limit/           @upstash/ratelimit wrappers
│   ├── shipping/             Shiprocket client (token cached in Redis)
│   ├── storage/              Supabase Storage + AWS S3 adapters
│   ├── trpc/                 All tRPC routers, context, middlewares
│   └── typescript-config/    Shared tsconfig.json presets
├── supabase/functions/       Supabase Edge Function source
├── apprunner.yaml            AWS App Runner config (builds client-main only)
├── Dockerfile.client.prod    Docker image for client-main
├── vercel.json               Vercel cron declaration
├── turbo.json                Turborepo task graph
├── package.json              Root workspaces + scripts
└── yarn.lock                 Yarn 4 Berry lockfile
```

Two apps, fourteen packages, managed with **Yarn 4.9.1** (Berry) + **Turborepo 2.3.3**.

### 1.2 Workspace + Turborepo wiring

**`package.json` (root)** declares the workspaces and the orchestration scripts:

```json
{
  "name": "nonrml",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo dev",
    "start": "turbo start",
    "lint": "turbo lint",
    "prisma:generate": "cd ./packages/prisma && yarn run generate"
  },
  "packageManager": "yarn@4.9.1"
}
```

Every directory under `apps/*` and `packages/*` is a Yarn workspace. Packages depend on each other with `"workspace:*"` — Yarn symlinks those into each workspace's `node_modules` so imports resolve without publishing to a registry.

**`turbo.json`** defines the build graph:

```json
{
  "globalDependencies": ["**/.env"],
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "!.next/cache/**"] },
    "generate": { "cache": false },
    "lint": { "dependsOn": ["^lint"] },
    "dev": { "cache": false, "persistent": true },
    "start": { "dependsOn": ["^start"] }
  }
}
```

Key behaviours:

- `^build` means *"first build every dependency of this package, then build the package itself."* When `yarn build` runs at the root, Turbo topologically sorts the workspace graph and builds packages before apps.
- `persistent: true` on `dev` tells Turbo this is a long-running process (not a one-shot build), so it stays attached to stdout and doesn't "complete."
- `globalDependencies: ["**/.env"]` means any change to any `.env` file invalidates the entire Turbo cache. Stops stale builds from leaking old env values.
- `outputs: [".next/**", "!.next/cache/**"]` caches the compiled Next output but excludes its internal cache (which is machine-specific).

### 1.3 Packages are source-only (no build step)

This is the single most important fact about how the monorepo operates:

```jsonc
// packages/trpc/package.json
{
  "name": "@nonrml/trpc",
  "exports": { ".": "./src/index.ts" }    //  <-- raw TypeScript, not compiled JS
}
```

Every `@nonrml/*` package exports `./src/index.ts` (or `./index.ts`) directly. There is no `tsc` pre-build, no `dist/`. This has three consequences:

1. **Next must transpile the packages itself.** Each app's `next.config` has an explicit allow-list:

   ```ts
   // apps/client-main/next.config.mjs
   transpilePackages: [
     "@nonrml/trpc", "@nonrml/configs", "@nonrml/cache",
     "@nonrml/common", "@nonrml/components", "@nonrml/shipping"
   ]
   ```

   Next's SWC compiler then runs on those packages as if they were part of the app's source tree. If a package isn't in this list, Next treats it as an external CJS dep and fails on ESM syntax.

2. **Hot reload is instant.** Editing a file in `@nonrml/trpc` triggers an immediate rebuild in both apps — no intermediate compile step.

3. **The `build` task graph is shallower than it looks.** Because packages don't have a `build` script, Turbo's `"dependsOn": ["^build"]` for apps is effectively a no-op for most of the graph. The only real build step is `next build` inside each app. (Prisma is the exception — see §1.5.)

### 1.4 The two apps

Both apps are Next.js 15 App Router apps consuming the same shared packages.

| | `client-main` | `admin-nonrml` |
|---|---|---|
| Port | 8080 | 3001 |
| React | 18 | 19 |
| Dev bundler | Webpack (default) | Turbopack (`--turbopack`) |
| Role | Storefront (products, cart, checkout, returns, account) | Backoffice (orders, inventory, products, credit notes, users) |
| State | Recoil + Zustand + TanStack Query | TanStack Query (+ react-hook-form for forms) |
| Auth | NextAuth (Credentials provider) | NextAuth (Credentials provider) |
| External UI kits | MUI, NextUI, CoreUI, Three.js, tsparticles, swiper | Radix primitives + tailwind only |

Structurally each app has:

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   └── trpc/[trpc]/          # tRPC catch-all (see §2)
│   ├── _trpc/                    # Typed tRPC hooks for the client
│   │   ├── client.ts
│   │   ├── provider.tsx
│   │   └── serverClient.ts
│   ├── provider.tsx              # Composes TRPCProvider / SessionProvider / RecoilRoot
│   ├── layout.tsx                # Mounts <Providers>
│   └── <route-segments>/...
├── components/
├── hooks/
├── lib/
└── providers/
```

`client-main` additionally has `api/cron`, `api/webhooks/paymentStatusUpdate`, `api/webhooks/deliveryShipmentUpdate`, `api/shippingInfoRzp`, and `api/health`. Admin has no webhook receivers.

Both apps extend the shared tsconfig:

```json
// apps/client-main/tsconfig.json
{ "extends": "../../packages/typescript-config/base.json", ... }
```

### 1.5 The Prisma package is special

Prisma is the only package that genuinely needs a build step — `prisma generate` produces a runtime client into `node_modules/@prisma/client`. This is why the root has:

```json
"scripts": { "prisma:generate": "cd ./packages/prisma && yarn run generate" }
```

And why the Dockerfile runs `cd ./packages/prisma && DATABASE_URL=... yarn generate` before `yarn build`. Without this, every tRPC handler that touches `ctx.prisma` would fail at runtime with "PrismaClient is unable to be run in the browser" (or generated-type-missing errors at compile).

The singleton pattern in [`packages/prisma/index.ts`](./packages/prisma/index.ts) is the canonical Prisma-in-Next incantation:

```ts
import PrismaIns from '@prisma/client'
export { Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaIns.PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaIns.PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const prismaEnums = PrismaIns.$Enums;
export type * as prismaTypes from "@prisma/client";
```

It caches the client on `globalThis` in dev so Next's hot-reload doesn't spawn one client per reload. In production, every module evaluation creates a new client — fine for a long-lived App Runner / Docker process, more subtle on serverless.

### 1.6 How a package becomes available inside an app

Take the flow where `client-main` calls something from `@nonrml/trpc`:

1. **Yarn install time** — Yarn sees `"@nonrml/trpc": "workspace:*"` in `apps/client-main/package.json` and symlinks `packages/trpc` into `apps/client-main/node_modules/@nonrml/trpc`.
2. **Import time** — `import { AppRouter } from "@nonrml/trpc"` resolves to `packages/trpc/src/index.ts` because of the `"exports"` map.
3. **Compile time** — Next's bundler sees the TS source, checks `next.config.mjs` → `transpilePackages`, confirms `@nonrml/trpc` is listed, runs it through SWC.
4. **Type check** — TypeScript uses the shared `@nonrml/typescript-config/base.json` rules (strict, ES2022, NodeNext module resolution) to type-check across the boundary.
5. **Runtime** — imports that reach into `@nonrml/prisma` or bcrypt are resolved via the normal `node_modules` tree; because they're workspace deps of `@nonrml/trpc`, Yarn hoisted or symlinked them into `apps/client-main/node_modules` too.

### 1.7 Package dependency graph

```
                   ┌──────────────┐
                   │   prisma     │   (Postgres schema + client singleton)
                   └──────┬───────┘
                          │
        ┌─────────────────┼─────────────────────────────────┐
        │                 │                                 │
 ┌──────▼────┐     ┌──────▼───────┐                 ┌───────▼────────┐
 │  common   │     │   configs    │                 │ External svc   │
 │ (helpers, │     │  (NextAuth,  │                 │ adapters:      │
 │  emails)  │     │  session)    │                 │ mailing, otp,  │
 └─────┬─────┘     └──────┬───────┘                 │ payment,       │
       │                  │                         │ shipping,      │
       │   ┌──────────────┼─────────┐               │ storage        │
       │   │              │         │               └────────┬───────┘
 ┌─────▼───▼───┐   ┌──────▼──┐  ┌───▼──────────┐            │
 │   cache    │   │  rate-  │  │              │            │
 │ (Upstash)  │   │  limit  │  │  components  │            │
 └─────┬──────┘   └────┬────┘  └──────┬───────┘            │
       │               │              │                    │
       └───────────────┴──────┬───────┴────────────────────┘
                              │
                      ┌───────▼────────┐
                      │     trpc       │  (appRouter, AppRouter type)
                      └───────┬────────┘
                              │
             ┌────────────────┴────────────────┐
             │                                 │
      ┌──────▼──────┐                   ┌──────▼──────┐
      │ client-main │                   │ admin-nonrml│
      └─────────────┘                   └─────────────┘
```

Everything flows up into `@nonrml/trpc`, and both Next apps consume tRPC. This is why deleting a single export from any leaf package can ripple into both apps — there's no compile-time seam between them.

### 1.8 Dev orchestration — what happens when you run `yarn dev`

1. `yarn dev` at the root → `turbo dev`.
2. Turbo reads `turbo.json`, finds the `dev` task, marks it `persistent` + `cache: false`.
3. Turbo walks the workspace graph and runs `yarn dev` in every workspace that defines one. Only `apps/client-main` and `apps/admin-nonrml` have a `dev` script, so only those start.
4. `client-main` starts `next dev -p 8080` (webpack), `admin-nonrml` starts `next dev -p 3001 --turbopack`.
5. Both Next instances load `@nonrml/*` packages directly from source (via `transpilePackages`). Any edit inside a package triggers HMR in both apps simultaneously.

### 1.9 Production build — what `yarn build` does

1. `yarn build` → `turbo run build`.
2. Turbo applies `"dependsOn": ["^build"]` — since packages don't have `build` scripts, this resolves to a topological no-op, leaving only the two apps' `next build`.
3. Each `next build`:
   - Runs SWC on its own source tree.
   - Sees imports to `@nonrml/*` packages and, because they're in `transpilePackages`, runs SWC on those too.
   - Emits `.next/` in each app (Turbo caches these on subsequent runs).
4. `.env` fingerprints are part of Turbo's cache key (via `globalDependencies`) so an env change triggers a rebuild.
5. Prisma is NOT rebuilt automatically — you must run `yarn prisma:generate` manually or inside CI before `yarn build` the first time or after schema changes.

---

## Question 2

> **"How is tRPC connected to next. Tell me how does the connection work and which file do what in establishing that connection."**

### 2.1 The three layers of the connection

The tRPC ↔ Next wiring spans three layers. Keep this mental model straight and every file makes sense:

1. **Shared router package** — defines procedures, middleware, context, and exports the `AppRouter` *type*.
2. **Next.js server mount** — a catch-all API route that hands every request to the router.
3. **Next.js client/SSR consumers** — React hooks (typed off `AppRouter`) and an in-process server caller for RSC.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        packages/trpc                                 │
│                                                                      │
│  trpc.ts          initTRPC.context<TRPCContext>().create(...)        │
│  contexts/        createContext({prisma, session, req, res})         │
│  procedures/      publicProcedure, adminProcedure, ...               │
│  middlewares/     isAuthed, isAdmin, rateLimitLoginMiddleware        │
│  routers/_app.ts  appRouter = router({ viewer, ... })                │
│                   export type AppRouter = typeof appRouter;          │
└───────────────┬────────────────────────────────────────┬─────────────┘
                │                                        │
                │ imports `appRouter` (value)            │ imports `AppRouter` (type)
                ▼                                        ▼
┌─────────────────────────────┐          ┌────────────────────────────────┐
│ apps/<app>/src/app/api/     │          │ apps/<app>/src/app/_trpc/      │
│   trpc/[trpc]/route.tsx     │          │   client.ts  (createTRPCReact) │
│                             │          │   provider.tsx (httpLink)      │
│ fetchRequestHandler({       │◄────────►│   serverClient.ts (in-proc)    │
│   endpoint:"/api/trpc",     │   HTTP   │                                │
│   router: appRouter,        │          │                                │
│   createContext:...         │          │                                │
│ })                          │          │                                │
└─────────────────────────────┘          └────────────────────────────────┘
```

### 2.2 Layer 1 — the shared router

| File | Role |
|---|---|
| [`packages/trpc/package.json`](./packages/trpc/package.json) | `"exports": { ".": "./src/index.ts" }` — imports from `@nonrml/trpc` resolve straight to TS source. |
| [`packages/trpc/src/index.ts`](./packages/trpc/src/index.ts) | Barrel: `export * from "./server"`. |
| [`packages/trpc/src/server/index.ts`](./packages/trpc/src/server/index.ts) | Re-exports `appRouter`, `AppRouter` type, `createContext`, `t`, `router`, `procedure`, `middleware`, `createServerCaller`. This is the public API. |
| [`packages/trpc/src/server/trpc.ts`](./packages/trpc/src/server/trpc.ts) | Initializes tRPC:<br>`const t = initTRPC.context<TRPCContext>().create({ transformer: SuperJSON })`<br>Exports `router`, `procedure`, `middleware`, `createServerCaller`. |
| [`packages/trpc/src/server/contexts/context.ts`](./packages/trpc/src/server/contexts/context.ts) | Defines `createContext({ session, req, res }) → { prisma, session, req, res }`. Every procedure receives this as `ctx`. |
| [`packages/trpc/src/server/middlewares/sessionMiddleware.ts`](./packages/trpc/src/server/middlewares/sessionMiddleware.ts) | `sessionMiddleware` (looks up user from DB using `ctx.session.user.id`), plus `isAuthed` and `isAdmin` chain variants. |
| [`packages/trpc/src/server/middlewares/rateLimitMiddleware.ts`](./packages/trpc/src/server/middlewares/rateLimitMiddleware.ts) | `rateLimitLoginMiddleware` — combines IP and mobile-number sliding-window limits via `@nonrml/rate-limit`. |
| [`packages/trpc/src/server/procedures/publicProcedure.ts`](./packages/trpc/src/server/procedures/publicProcedure.ts) | `publicProcedure` (bare) and `loginRestrictedProcedure` (adds rate-limit). |
| [`packages/trpc/src/server/procedures/authedProcedure.ts`](./packages/trpc/src/server/procedures/authedProcedure.ts) | `publicProtectedProcedure` (requires auth), `adminProcedure` (requires admin role). |
| [`packages/trpc/src/server/routers/viewer/<domain>/`](./packages/trpc/src/server/routers/viewer) | Per-domain triad: `_router.ts` (route definitions), `*.handler.ts` (business logic), `*.schema.ts` (Zod input schemas). |
| [`packages/trpc/src/server/routers/viewer/_router.ts`](./packages/trpc/src/server/routers/viewer/_router.ts) | Merges all domain routers into `viewerRouter`. |
| [`packages/trpc/src/server/routers/_app.ts`](./packages/trpc/src/server/routers/_app.ts) | **`appRouter = router({ viewer: viewerRouter, ... })` + `export type AppRouter = typeof appRouter`**. This is the contract Next consumes. |

### 2.3 Layer 2 — the Next.js server mount

This is the single file that physically plugs tRPC into Next's HTTP request pipeline.

**[`apps/client-main/src/app/api/trpc/[trpc]/route.tsx`](./apps/client-main/src/app/api/trpc/[trpc]/route.tsx)** (identical in admin):

```tsx
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@nonrml/trpc";
import { getSession } from "@nonrml/configs";

const handler = async (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createContext({ req, session: await getSession() }),
    responseMeta() {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      };
    },
  });

export { handler as GET, handler as POST };
```

**Each element of this file, explained:**

- **`[trpc]` folder name** — Next App Router catch-all segment. Matches any URL under `/api/trpc/…` — e.g. `/api/trpc/viewer.product.getProduct`, `/api/trpc/viewer.orders.placeOrder`. tRPC parses the procedure path from the URL.
- **`fetchRequestHandler`** — tRPC's adapter for the Web Fetch API (what Next 13+ route handlers use). Responsibilities:
  1. Parse the URL → procedure path.
  2. Look up the procedure on `router: appRouter`.
  3. Invoke `createContext()` to build `ctx`.
  4. Run the middleware chain attached to that procedure.
  5. Validate input against the Zod schema.
  6. Call the handler, serialize the result with SuperJSON, return a `Response`.
- **`createContext: async () => createContext({ req, session: await getSession() })`** — called once per request. `getSession()` reads the NextAuth JWT cookie via `getServerSession(NEXT_AUTH_CONFIG)`. `ctx.session` is then available to every middleware/procedure for auth checks.
- **`responseMeta()`** — attaches response headers. The current CORS config (`Access-Control-Allow-Origin: "*"` + `Access-Control-Allow-Credentials: "true"`) is invalid per spec — see Question 3.
- **`export { handler as GET, handler as POST }`** — Next's route convention. Queries arrive as GET, mutations as POST. tRPC handles both identically.

### 2.4 Layer 2 — supporting config

**[`apps/client-main/next.config.mjs`](./apps/client-main/next.config.mjs)**:

```js
transpilePackages: ["@nonrml/trpc", "@nonrml/configs", "@nonrml/cache",
                    "@nonrml/common", "@nonrml/components", "@nonrml/shipping"]
```

Because `@nonrml/trpc` exports raw TypeScript (`./src/index.ts`), Next has to run its SWC pipeline over it. Without this list Next treats the package as an external CJS dependency and the build fails on ESM imports.

**[`apps/client-main/src/app/api/auth/[...nextauth]`](./apps/client-main/src/app/api/auth)** — hosts NextAuth, which issues the JWT cookie that `getSession()` reads in the tRPC route. Not tRPC code, but tRPC's session dimension depends on it.

### 2.5 Layer 3 — client-side consumers

**[`apps/client-main/src/app/_trpc/client.ts`](./apps/client-main/src/app/_trpc/client.ts)** — the type bridge:

```ts
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@nonrml/trpc";
import type { inferRouterOutputs, inferRouterInputs } from "@trpc/server";

export const trpc = createTRPCReact<AppRouter>();
export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput  = inferRouterInputs<AppRouter>;
```

This single import of the `AppRouter` **type** gives you fully autocompleted/typed hooks: `trpc.viewer.product.getProduct.useQuery(...)`. Only the *type* crosses the client bundle boundary; no server code (Prisma, bcrypt, etc.) is shipped to the browser.

**[`apps/client-main/src/app/_trpc/provider.tsx`](./apps/client-main/src/app/_trpc/provider.tsx)** — the runtime wiring (a React client component):

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import { trpc } from "./client";
import SuperJSON from "superjson";

export default function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: SuperJSON,
      links: [
        httpLink({
          url: "/api/trpc",
          fetch(url, options) {
            return fetch(url, { ...options, credentials: "include" });
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

- **`httpLink({ url: "/api/trpc" })`** is the client mirror of `endpoint: "/api/trpc"` on the server. Same URL, same contract.
- **`credentials: "include"`** makes the browser send the NextAuth cookie so `getSession()` on the server can identify the user.
- **`SuperJSON`** transformer matches the server's, so `Date`, `BigInt`, etc. round-trip faithfully.
- Both clients are memoised in state (`useState(() => ...)`) so they survive re-renders and don't leak new connections.

**[`apps/client-main/src/app/provider.tsx`](./apps/client-main/src/app/provider.tsx)** — composes the app-level providers:

```tsx
"use client";
export const Providers = ({ children }: { children: ReactNode }) => (
  <TRPCProvider>
    <SessionProvider>
      <RecoilRoot>{children}</RecoilRoot>
    </SessionProvider>
  </TRPCProvider>
);
```

**[`apps/client-main/src/app/layout.tsx`](./apps/client-main/src/app/layout.tsx)** wraps `children` in `<Providers>`, so every page gets the tRPC client.

**[`apps/client-main/src/app/_trpc/serverClient.ts`](./apps/client-main/src/app/_trpc/serverClient.ts)** — the SSR/RSC path (no HTTP):

```ts
import { getSession } from "@nonrml/configs";
import { createServerCaller } from "@nonrml/trpc";

export const serverClient = async () => createServerCaller(await getSession());
```

For React Server Components, route handlers, or server actions that need tRPC data *on the server*, `serverClient()` bypasses HTTP entirely. `createServerCaller` uses `t.createCallerFactory(appRouter)(ctx)` under the hood to invoke `appRouter` directly in-process. Same router, same types, zero network hop.

Used notably in webhook routes like [`apps/client-main/src/app/api/webhooks/paymentStatusUpdate/route.ts`](./apps/client-main/src/app/api/webhooks/paymentStatusUpdate/route.ts):

```ts
const result = await (await serverClient()).viewer.payment.rzpPaymentUpdateWebhook({
  rzpOrderId, paymentStatus,
});
```

### 2.6 End-to-end request walkthrough

Scenario: a page in `client-main` renders
```tsx
const { data } = trpc.viewer.product.getProduct.useQuery({ productSku: "TEE-01" });
```

Step-by-step across the three layers:

1. **Compile time** — `_trpc/client.ts` produces typed hooks from the `AppRouter` type. No runtime cost; purely TypeScript inference.
2. **Render time** — the hook queries TanStack Query's cache. On a miss it delegates to the `trpcClient` from `_trpc/provider.tsx`.
3. **HTTP** — `httpLink` serializes `{ productSku: "TEE-01" }` with SuperJSON and fires `GET /api/trpc/viewer.product.getProduct?batch=1&input=…` with the NextAuth cookie attached.
4. **Next routing** — Next matches `app/api/trpc/[trpc]/route.tsx` (catch-all), invokes the exported `GET` handler.
5. **tRPC dispatch** — `fetchRequestHandler` parses `viewer.product.getProduct` from the URL, calls `createContext()`:
   - `getSession()` reads the JWT cookie and returns `{ user: { id, role } }` or `null`.
   - `createContext` returns `{ prisma, session, req }`.
6. **Middleware chain** — `getProduct` is a `publicProcedure`, so no auth middleware runs. If it were `adminProcedure` the chain would be `sessionMiddleware` → `isAuthed` → `isAdmin`.
7. **Input validation** — the Zod schema from `product.schema.ts` (`ZGetProductSchema`) parses the input. Fails → `BAD_REQUEST` error.
8. **Handler** — [`product.handler.ts`](./packages/trpc/src/server/routers/viewer/products/product.handler.ts) runs:
   - `customCacheJSONIncr({ key: "VISITED", path: input.productSku })` bumps a visit counter in Redis.
   - Tries Redis first (`cacheServicesRedisClient().get('product_${sku}')`).
   - On miss, queries Postgres via `ctx.prisma.products.findUniqueOrThrow(...)`.
9. **Serialization** — handler returns a plain object; SuperJSON serializes dates/bigints.
10. **Client** — `httpLink` deserializes; TanStack Query caches the result; `useQuery` returns typed data; component re-renders.

A `mutation` (POST) follows the same path; the only differences are HTTP method and that TanStack Query doesn't cache mutations.

### 2.7 Summary of files responsible for the connection

| Layer | File | One-sentence job |
|---|---|---|
| Shared | `packages/trpc/src/server/trpc.ts` | Creates the tRPC root (`t`, `router`, `procedure`, `middleware`). |
| Shared | `packages/trpc/src/server/contexts/context.ts` | Builds `ctx` for each request. |
| Shared | `packages/trpc/src/server/routers/_app.ts` | Composes `appRouter` + exports the `AppRouter` type. |
| Server | `apps/<app>/src/app/api/trpc/[trpc]/route.tsx` | Next catch-all route; hands requests to `fetchRequestHandler`. |
| Server | `apps/<app>/next.config.{mjs,ts}` | Lists `@nonrml/*` packages in `transpilePackages` so Next compiles them. |
| Server | `packages/configs/nextAuth/nextAuth.config.ts` | Exports `getSession()` used by the tRPC route to populate `ctx.session`. |
| Client | `apps/<app>/src/app/_trpc/client.ts` | Creates typed React hooks via `createTRPCReact<AppRouter>()`. |
| Client | `apps/<app>/src/app/_trpc/provider.tsx` | Runtime `trpcClient` + TanStack Query provider. |
| Client | `apps/<app>/src/app/provider.tsx` | Composes `TRPCProvider` with `SessionProvider` + `RecoilRoot`. |
| Client | `apps/<app>/src/app/layout.tsx` | Mounts `<Providers>` at the root. |
| SSR | `apps/<app>/src/app/_trpc/serverClient.ts` | In-process caller for RSC / route handlers — no HTTP. |

---

## Question 3

> **"Is there anything else I should be aware of that is technically important in this project?"**

### 3.1 Security — urgent

| Issue | Details |
|---|---|
| **Committed `.env` with live credentials** | The root [`.env`](./.env) contains the real Supabase Postgres password and Upstash Redis REST token. It's in git history. **Rotate both immediately** (Supabase password reset + Upstash regenerate token). |
| **CORS `"*"` + `credentials: "include"`** | The tRPC route emits `Access-Control-Allow-Origin: "*"` and `Access-Control-Allow-Credentials: "true"` simultaneously. The CORS spec forbids that combination; browsers reject preflight. Works today only because all traffic is same-origin. First cross-subdomain call will fail silently. Fix: echo the `Origin` header or hardcode the storefront/admin origins. |
| **Weak default secrets** | [`nextAuth.config.ts`](./packages/configs/nextAuth/nextAuth.config.ts) falls back to `NEXTAUTH_SECRET || 'secr3t'` and `JWT_SECRET || 'secret'`. If the env vars aren't set in any environment, sessions become trivially forgeable. |
| **Credentials-provider auth is `id`-only** | [`nextAuth.config.ts:51`](./packages/configs/nextAuth/nextAuth.config.ts) authorizes based solely on `credentials.id` — no password, no OTP verification inside the provider. OTP must be verified in the tRPC `auth` router before the client calls `signIn("credentials", { id })`. Audit every callsite of `signIn` in client code — a direct call with any user id logs you in as that user. |

### 3.2 Architectural gotchas

**Source-only packages require explicit transpile lists.** `admin-nonrml`'s `next.config.ts` lists only:
```ts
transpilePackages: ["@nonrml/trpc", "@nonrml/configs", "@nonrml/cache",
                    "@nonrml/common", "@nonrml/components"]
```
Admin imports from `@nonrml/trpc`, which at module-load pulls in `@nonrml/prisma`, `@nonrml/mailing`, `@nonrml/payment`, `@nonrml/shipping`, `@nonrml/otp`, `@nonrml/rate-limit`, `@nonrml/storage`. Those are *not* in `transpilePackages`. It works today because the chain happens to resolve through CJS interop, but add any new package or ESM-only dep and admin builds break mysteriously.

**React version skew.** `client-main` uses React 18, `admin-nonrml` uses React 19. Both consume `@nonrml/components`. Add any React 19-only API there (e.g. new form actions, `use()` hook patterns) and client-main breaks. React-DOM types will also clash at the tsconfig level if the apps' `node_modules` ever hoist the other's version.

**Single Prisma client across both apps, no read split.** Heavy admin queries (bulk inventory updates, reporting) can stall storefront queries because both apps ultimately connect to the same Supabase pooler.

**Prisma connection URL split.** [`.env`](./.env) contains:
- `DATABASE_URL` → port 6543, `?pgbouncer=true` (pooler, for runtime queries)
- `DIRECT_URL` → port 5432 (direct, for migrations)

Don't flip these. Prepared statements over pgbouncer in transaction-pool mode will 500; migrations over the pooler can hang.

**Upstash Redis is a hidden single point of failure.** Used by:
- `@nonrml/cache` — product cache, visit counters.
- `@nonrml/rate-limit` — login rate limiting.
- `@nonrml/shipping` — Shiprocket token cache.
- [`api/webhooks/paymentStatusUpdate`](./apps/client-main/src/app/api/webhooks/paymentStatusUpdate/route.ts) — Razorpay webhook idempotency keys.

If Upstash is down:
- Rate-limit middleware throws a raw `Error` → login fails for all users.
- Webhook idempotency check logs a warning and *falls through* → duplicate Razorpay events may double-process refunds.
- Visit-count increments silently no-op.

### 3.3 Deployment asymmetry

| Artefact | Scope |
|---|---|
| [`apprunner.yaml`](./apprunner.yaml) | Builds and runs **client-main only**, exposes port 8080. |
| [`Dockerfile.client.prod`](./Dockerfile.client.prod) | Docker image for **client-main only**. |
| [`vercel.json`](./vercel.json) | Declares Vercel cron on `/api/cron` daily at 01:00 UTC. |

- There is **no deployment config for admin-nonrml** in the repo. Either deployed manually, or via infrastructure outside version control, or not yet deployed.
- `vercel.json` + `apprunner.yaml` imply `client-main` might be deployed on **both** Vercel (for cron) and App Runner (for traffic). If both instances receive webhooks, Razorpay events can double-fire. Confirm which is primary.
- `Dockerfile.client.prod` runs `RUN yarn install` without `--immutable`, so lockfile drift is possible in container builds.

### 3.4 Cron + Supabase Edge Function split

[`apps/client-main/src/app/api/cron/route.ts`](./apps/client-main/src/app/api/cron/route.ts):

1. Receives a Vercel cron hit with `Authorization: Bearer ${CRON_SECRET}`.
2. Queries Supabase table **`cdynamicCnfig`** (sic — typo; the Prisma model is `DynamicConfig`) for a row with `key = 'prod_edge_function_url'`.
3. POSTs to the URL from that row (a Supabase Edge Function).

Two things to note:
- The actual scheduled work lives in a Supabase Edge Function at [`supabase/functions/update_visit`](./supabase/functions/update_visit) — *not* in Next.js. Maintaining this requires access to the Supabase project.
- The table name in the code (`cdynamicCnfig`) does not match the Prisma schema. Either a Supabase-side view/alias exists, or this endpoint 500s silently. Worth verifying.

### 3.5 Code-level subtleties

**Two bcrypt libraries.** Root and `@nonrml/trpc` use `bcrypt` (native, requires node-gyp). `client-main` additionally has `bcryptjs`. Hash format is compatible but APIs aren't — an accidental `import bcrypt from 'bcryptjs'` where `bcrypt` is expected will silently mismatch on edge cases (sync vs async, salt handling).

**Handlers import `prisma` directly.** Many handlers do `import { prisma } from "@nonrml/prisma"` instead of using `ctx.prisma`. Same singleton, so runtime behaviour is identical — but:
- Defeats the context-injection seam (harder to mock in tests, harder to wrap in transactions).
- Makes context-scoped behaviours (per-request transactions, tenant isolation) retrofits impossible without refactoring every handler.

**`loadEnv` helper is imported but every callsite is commented out.** Grep shows:
```
packages/storage/src/s3/connect.ts:4:     // loadEnv(...)
packages/mailing/src/zeptoMail/service.ts:4:  // loadEnv(...)
packages/configs/nextAuth/nextAuth.config.ts:9: // loadEnv(...)
packages/cache/src/connection/connect.ts:4:   // loadEnv(...)
...
```
Packages rely entirely on the host process already having env loaded. Fine inside Next apps (Next auto-loads `.env`). Will silently break if anyone tries to use one of these packages as a standalone Node script.

**No tests.** Every `package.json` has the default `"test": "echo \"Error: no test specified\" && exit 1"`. There is no CI-level safety net.

**Different dev bundlers.** `admin-nonrml` uses Turbopack (`next dev --turbopack`), `client-main` uses Webpack (the default). Module resolution differs in edge cases — a bug can appear in one and not the other. Production uses Webpack in both (default `next build`).

**Rate-limit middleware throws raw `Error`, not `TRPCError`.** [`rateLimitMiddleware.ts:25`](./packages/trpc/src/server/middlewares/rateLimitMiddleware.ts): `throw new Error("Too many request, try after sometime")`. tRPC's error formatter can't map this to `TOO_MANY_REQUESTS`; clients see `INTERNAL_SERVER_ERROR` instead. Should be `throw new TRPCError({ code: "TOO_MANY_REQUESTS", ... })`.

**Server-only imports leak easily.** Because `@nonrml/trpc` is a server package that also exports types, any `import { something } from "@nonrml/trpc"` (value, not type) in a `"use client"` file pulls Prisma/bcrypt into the client bundle. Rule: only import `type`s from `@nonrml/trpc` in client code. Server-only code goes through `api/trpc/[trpc]/route.tsx` or `_trpc/serverClient.ts`.

**SuperJSON must stay in sync on both ends.** If you ever write a bare `fetch("/api/trpc/…")` (e.g. from a non-React context), you need to run SuperJSON on both the input and the response — the tRPC client does this invisibly.

### 3.6 What's not in this repo

- **Deployment config for `admin-nonrml`** — not in git.
- **The Supabase Edge Function logic** — only referenced by URL from a Supabase table row. Maintained in the Supabase project console.
- **Any kind of test suite, CI definition, or lint-on-commit hook.**
- **A per-app `.env.example`** — package-level `.env.example` files exist but are nearly empty. Full env contract is implicit.

### 3.7 Top action items

In order of urgency:

1. **Rotate the secrets in the committed `.env`** (Supabase DB password, Upstash token). Add `.env` to `.gitignore` and remove from history with `git filter-repo` or BFG.
2. **Fix the CORS config** — remove `Access-Control-Allow-Origin: "*"` while `credentials: "include"` is in use. Echo the `Origin` against an allow-list.
3. **Set real values for `NEXTAUTH_SECRET` and `JWT_SECRET`** in every environment. Verify no deployment is running on the string `'secr3t'`.
4. **Audit every `signIn("credentials", ...)` call** in client code to confirm OTP verification happens before `signIn`, not after.
5. **Align `admin-nonrml`'s `transpilePackages`** with the full set of transitively imported `@nonrml/*` packages.
6. **Decide which deployment target is authoritative** (Vercel vs App Runner) and disable webhooks on the other, or add idempotency keys at the DB layer as a belt-and-suspenders.
7. **Clarify `cdynamicCnfig` vs `DynamicConfig`** — one or the other is wrong. Rename and/or run a migration.

---

## Question 4

> **"TRPC has no official documentation on how to connect it with next's app router, right? Explain that as well in the document, how does the connect works and Which file plays what role?"**

### 4.1 The premise — tRPC *does* have official docs

The common belief that "tRPC has no App Router docs" is inaccurate, but there is a grain of truth: there isn't one single end-to-end "copy-paste this for App Router" page. Instead, tRPC documents the primitives, and you assemble them. This repo assembles them in the canonical way.

The relevant official docs are:

| Doc page | URL | What it covers |
|---|---|---|
| **Fetch adapter** | [trpc.io/docs/server/adapters/fetch](https://trpc.io/docs/server/adapters/fetch) | `fetchRequestHandler` — the only thing you need to mount a router inside any Web-Fetch-compatible runtime (Next App Router, Cloudflare Workers, Deno, etc.). |
| **Next.js integration** | [trpc.io/docs/client/nextjs](https://trpc.io/docs/client/nextjs) | Older Pages-Router-focused guide; still relevant for NextAuth-style session reads. |
| **Server Components** | [trpc.io/docs/client/react/server-components](https://trpc.io/docs/client/react/server-components) | The dedicated RSC / App Router page covering `createCallerFactory` for in-process calls. |
| **`createTRPCReact`** | [trpc.io/docs/client/react](https://trpc.io/docs/client/react) | Typed React Query hooks keyed on an `AppRouter` type. |
| **Context** | [trpc.io/docs/server/context](https://trpc.io/docs/server/context) | `createContext` pattern — what this repo uses to inject Prisma + NextAuth session. |
| **SuperJSON transformer** | [trpc.io/docs/server/data-transformers](https://trpc.io/docs/server/data-transformers) | How the `Date`/`BigInt` serialization in this repo works. |

### 4.2 How the official pattern maps to this repo

tRPC's recommended architecture for the App Router boils down to three official building blocks. Each has an exact counterpart in this codebase:

| Official building block | What the docs say | File in this repo |
|---|---|---|
| 1. Initialize tRPC once with a context type + transformer | `initTRPC.context<T>().create({ transformer })` | [`packages/trpc/src/server/trpc.ts`](./packages/trpc/src/server/trpc.ts) |
| 2. Define `createContext` that runs per-request | A function returning `{ ...whatever procedures need }` | [`packages/trpc/src/server/contexts/context.ts`](./packages/trpc/src/server/contexts/context.ts) |
| 3. Compose routers and export both the instance AND the type | `export const appRouter = router({...}); export type AppRouter = typeof appRouter` | [`packages/trpc/src/server/routers/_app.ts`](./packages/trpc/src/server/routers/_app.ts) |
| 4. Mount via fetch adapter in a Next route handler | `fetchRequestHandler({ endpoint, req, router, createContext })` inside `app/api/.../[trpc]/route.ts` exporting `GET`/`POST` | [`apps/client-main/src/app/api/trpc/[trpc]/route.tsx`](./apps/client-main/src/app/api/trpc/[trpc]/route.tsx) |
| 5. Create typed React hooks from the `AppRouter` type | `export const trpc = createTRPCReact<AppRouter>()` | [`apps/client-main/src/app/_trpc/client.ts`](./apps/client-main/src/app/_trpc/client.ts) |
| 6. Wire `httpLink` + TanStack Query in a client provider | `trpc.createClient({ links: [httpLink({ url })], transformer })` inside a `"use client"` provider | [`apps/client-main/src/app/_trpc/provider.tsx`](./apps/client-main/src/app/_trpc/provider.tsx) |
| 7. For RSC/server actions: use `createCallerFactory` to call the router in-process | `t.createCallerFactory(appRouter)(ctx)` | [`packages/trpc/src/server/trpc.ts`](./packages/trpc/src/server/trpc.ts) (as `createServerCaller`) + [`apps/client-main/src/app/_trpc/serverClient.ts`](./apps/client-main/src/app/_trpc/serverClient.ts) |

That is the whole connection. Every piece above has a dedicated tRPC docs page behind it; this repo is a faithful implementation of the officially documented primitives.

### 4.3 Why it feels under-documented

Three reasons people assume App Router support is missing from the docs:

1. **The `create-t3-app` / legacy tutorials target the Pages Router.** Most blog posts show `pages/api/trpc/[trpc].ts` with `createNextApiHandler`, not the fetch adapter. That's what this repo's pattern replaces.
2. **The App Router docs live on a separate "Server Components" page**, not inline on the main Next.js page. Easy to miss if you start at the top of the Next.js section.
3. **`createCallerFactory` is documented as a generic primitive**, not as "how to call tRPC from an RSC." The `serverClient.ts` pattern in this repo is an obvious use but you have to connect the dots yourself.

### 4.4 File-by-file role — the full connection

Walking the connection in the order a request travels:

#### Server side (router definition → HTTP mount)

**[`packages/trpc/package.json`](./packages/trpc/package.json)**
- Declares `"exports": { ".": "./src/index.ts" }` so `import from "@nonrml/trpc"` resolves to raw TypeScript source.
- Lists every workspace dep (`@nonrml/prisma`, `@nonrml/cache`, etc.) that handlers touch at runtime.

**[`packages/trpc/src/index.ts`](./packages/trpc/src/index.ts)**
- One-liner: `export * from "./server"`. The public entry point.

**[`packages/trpc/src/server/index.ts`](./packages/trpc/src/server/index.ts)**
- Re-exports `appRouter`, `AppRouter` type, `createContext`, `t`, `router`, `procedure`, `middleware`, `createServerCaller`. This is the exact surface Next imports from.

**[`packages/trpc/src/server/trpc.ts`](./packages/trpc/src/server/trpc.ts)**
- Official pattern: `initTRPC.context<TRPCContext>().create({ transformer: SuperJSON })`.
- Exports `router`, `procedure`, `middleware` (the three primitives every router file uses).
- Also exports `createServerCaller` built via `t.createCallerFactory(appRouter)` — this is the RSC escape hatch.

**[`packages/trpc/src/server/contexts/context.ts`](./packages/trpc/src/server/contexts/context.ts)**
- Defines `TRPCContext = { prisma, session, req, res }`.
- Exports `createContext({ session, req, res }) → TRPCContext`. Called once per request (and once per `createServerCaller` invocation).
- This is where Prisma + NextAuth session get injected into every procedure.

**[`packages/trpc/src/server/middlewares/sessionMiddleware.ts`](./packages/trpc/src/server/middlewares/sessionMiddleware.ts)**
- `sessionMiddleware`: throws `UNAUTHORIZED` if `ctx.session` is missing; else loads the user from Postgres.
- `isAuthed`: pipes through session middleware, exposes `ctx.user`.
- `isAdmin`: pipes through `isAuthed`, checks `user.role === "ADMIN"`.

**[`packages/trpc/src/server/middlewares/rateLimitMiddleware.ts`](./packages/trpc/src/server/middlewares/rateLimitMiddleware.ts)**
- `rateLimitLoginMiddleware`: sliding-window limits on IP + mobile number via `@nonrml/rate-limit`.

**[`packages/trpc/src/server/procedures/publicProcedure.ts`](./packages/trpc/src/server/procedures/publicProcedure.ts)**
- `publicProcedure` (no middleware), `loginRestrictedProcedure` (rate-limit applied).

**[`packages/trpc/src/server/procedures/authedProcedure.ts`](./packages/trpc/src/server/procedures/authedProcedure.ts)**
- `publicProtectedProcedure` (must be logged in), `adminProcedure` (must be admin).

**[`packages/trpc/src/server/routers/viewer/<domain>/`](./packages/trpc/src/server/routers/viewer)**
- Consistent triad per domain:
  - `_router.ts` — defines routes, binds procedures to handlers.
  - `*.handler.ts` — business logic (Prisma + Redis + external services).
  - `*.schema.ts` — Zod input schemas + inferred TypeScript types.

**[`packages/trpc/src/server/routers/viewer/_router.ts`](./packages/trpc/src/server/routers/viewer/_router.ts)**
- Merges all domain routers: `viewerRouter = router({ auth, orders, product, inventory, ... })`.

**[`packages/trpc/src/server/routers/_app.ts`](./packages/trpc/src/server/routers/_app.ts)**
- The contract file: `appRouter = router({ viewer: viewerRouter, testAPI: ... })` plus **`export type AppRouter = typeof appRouter`**. This type is what the client imports to get full type safety.

**[`apps/client-main/src/app/api/trpc/[trpc]/route.tsx`](./apps/client-main/src/app/api/trpc/[trpc]/route.tsx)**
- The single file that physically mounts tRPC into Next.
- Calls `fetchRequestHandler({ endpoint: "/api/trpc", req, router: appRouter, createContext: async () => createContext({ req, session: await getSession() }) })`.
- Exports `handler as GET` and `handler as POST` — Next's App Router route convention for HTTP methods.
- The `[trpc]` folder name is a Next catch-all segment; tRPC reads the procedure path off the URL.

**[`packages/configs/nextAuth/nextAuth.config.ts`](./packages/configs/nextAuth/nextAuth.config.ts)**
- Provides `getSession()` which calls `getServerSession(NEXT_AUTH_CONFIG)` — reads the JWT cookie on the server.
- Also exports the augmented `session` type that's used in `TRPCContext`.

**[`apps/client-main/next.config.mjs`](./apps/client-main/next.config.mjs)**
- `transpilePackages: ["@nonrml/trpc", ...]` — tells Next to run SWC on workspace packages because they ship as TypeScript source.

#### Client side (typed hooks → HTTP call)

**[`apps/client-main/src/app/_trpc/client.ts`](./apps/client-main/src/app/_trpc/client.ts)**
- The type bridge: `export const trpc = createTRPCReact<AppRouter>()`.
- Imports `AppRouter` as a **type only**, so no server code leaks into the client bundle.
- Also exports `RouterOutput` and `RouterInput` helper types for component prop typing.

**[`apps/client-main/src/app/_trpc/provider.tsx`](./apps/client-main/src/app/_trpc/provider.tsx)**
- `"use client"` component.
- Instantiates `QueryClient` and `trpcClient` once via `useState(() => ...)`.
- Configures `httpLink({ url: "/api/trpc" })` — mirrors the server's `endpoint`.
- `credentials: "include"` in the custom `fetch` ensures the NextAuth cookie is sent.
- `transformer: SuperJSON` mirrors the server's transformer.
- Wraps children in `<trpc.Provider><QueryClientProvider>`.

**[`apps/client-main/src/app/provider.tsx`](./apps/client-main/src/app/provider.tsx)**
- Composes providers: `<TRPCProvider><SessionProvider><RecoilRoot>{children}</RecoilRoot></SessionProvider></TRPCProvider>`.
- Must be the outermost wrapper so every page/component can call `trpc.x.y.useQuery`.

**[`apps/client-main/src/app/layout.tsx`](./apps/client-main/src/app/layout.tsx)**
- The App Router root layout. Renders `<Providers>{children}</Providers>` inside `<body>`, making the tRPC client available everywhere.

#### Server-side callers (RSC / webhooks / route handlers)

**[`apps/client-main/src/app/_trpc/serverClient.ts`](./apps/client-main/src/app/_trpc/serverClient.ts)**
- `export const serverClient = async () => createServerCaller(await getSession())`.
- Invokes `appRouter` directly in-process — no HTTP round trip.
- Use from RSC, server actions, webhook handlers, cron routes. **Never** import from a `"use client"` file (Prisma will crash the bundler).

**[`apps/client-main/src/app/api/webhooks/paymentStatusUpdate/route.ts`](./apps/client-main/src/app/api/webhooks/paymentStatusUpdate/route.ts)**
- Concrete example of `serverClient()` in action:
  ```ts
  const result = await (await serverClient())
    .viewer.payment.rzpPaymentUpdateWebhook({ rzpOrderId, paymentStatus });
  ```
- Demonstrates why the RSC caller exists: Razorpay webhooks hit a plain Next route, which re-uses tRPC business logic without making an internal HTTP call to itself.

### 4.5 Request lifecycle, annotated

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Browser: <Page/> calls                                                       │
│   trpc.viewer.product.getProduct.useQuery({ productSku: "TEE-01" })          │
│                                                                              │
│   Typed by:  _trpc/client.ts  (createTRPCReact<AppRouter>())                 │
│              └─ AppRouter type from packages/trpc/src/server/routers/_app.ts │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ TanStack Query cache miss
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ _trpc/provider.tsx → trpcClient (httpLink)                                   │
│                                                                              │
│   SuperJSON.serialize(input) → GET /api/trpc/viewer.product.getProduct?...   │
│   Headers: Cookie (NextAuth), Content-Type                                   │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ HTTP
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Next App Router matches: app/api/trpc/[trpc]/route.tsx                       │
│   exports GET → fetchRequestHandler(...)                                     │
│                                                                              │
│     endpoint:      "/api/trpc"                                               │
│     router:        appRouter               (packages/trpc/.../routers/_app)  │
│     createContext: createContext({         (packages/trpc/.../contexts/ctx)  │
│       req,                                                                   │
│       session: await getSession()          (packages/configs/nextAuth/...)   │
│     })                                                                       │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ tRPC dispatch on "viewer.product.getProduct"
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Middleware chain (publicProcedure → no auth middleware for this one)         │
│ Zod input parse via ZGetProductSchema  (products/product.schema.ts)          │
│ Handler: getProduct({ ctx, input })     (products/product.handler.ts)        │
│   - ctx.prisma.products.findUniqueOrThrow(...)                               │
│   - cacheServicesRedisClient().get(`product_${sku}`)                         │
│   - returns typed product object                                             │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ SuperJSON serialize
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Response flows back → httpLink deserializes → TanStack Query caches →        │
│ useQuery() returns { data, isLoading, error } — fully typed off AppRouter    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.6 One-line summary per file

| File | One-line job |
|---|---|
| `packages/trpc/src/server/trpc.ts` | Creates the tRPC root (`t`, `router`, `procedure`, `middleware`, `createServerCaller`). |
| `packages/trpc/src/server/contexts/context.ts` | Builds `{ prisma, session, req, res }` for each request. |
| `packages/trpc/src/server/routers/_app.ts` | Composes `appRouter` and exports the `AppRouter` type. |
| `packages/trpc/src/server/procedures/*.ts` | Declares the four procedure flavours (public, rate-limited, authed, admin). |
| `packages/trpc/src/server/middlewares/*.ts` | Session lookup, auth gating, rate limiting. |
| `packages/trpc/src/server/routers/viewer/<domain>/_router.ts` | Binds domain procedures to handlers + Zod schemas. |
| `packages/configs/nextAuth/nextAuth.config.ts` | Exports `getSession()` used by the server mount. |
| `apps/<app>/src/app/api/trpc/[trpc]/route.tsx` | Mounts `appRouter` behind Next's catch-all route via `fetchRequestHandler`. |
| `apps/<app>/next.config.{mjs,ts}` | `transpilePackages` list so Next compiles `@nonrml/*` from source. |
| `apps/<app>/src/app/_trpc/client.ts` | Typed React hooks via `createTRPCReact<AppRouter>()`. |
| `apps/<app>/src/app/_trpc/provider.tsx` | Runtime `trpcClient` + TanStack Query provider (client component). |
| `apps/<app>/src/app/provider.tsx` | Composes `TRPCProvider` with NextAuth + Recoil. |
| `apps/<app>/src/app/layout.tsx` | Mounts `<Providers>` at the App Router root. |
| `apps/<app>/src/app/_trpc/serverClient.ts` | In-process caller for RSC / webhooks / cron (no HTTP). |
