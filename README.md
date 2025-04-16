# Starter

This is official repository of NoNRML, a expressive streetwear clothing brand.

## What's inside?

This is a Turborepo and it includes the following packages/apps:

### Apps and Packages

- `apps/admin-nonrml`: A [Next.js](https://nextjs.org/) application that serves as the admin panel for managing the NoNRML platform.
- `apps/client-main`: A [Next.js](https://nextjs.org/) client-facing application — the main storefront for NoNRML customers.
- `apps/cron`: A Node.js application that handlers the cron jobs
- `infra`: A Terraform project for provisioning and deploying the entire infrastructure stack, including apps, DNS, and security services.
- `@nonrml/cache`: Node utility for handling application-level caching (e.g., Redis, memory cache).
- `@nonrml/common`: Shared utility functions, constants, and helpers reused across all apps and packages.
- `@nonrml/components`: Shared React component library used across both `apps/client-main` and `apps/admin-nonrml` apps for UI consistency and reusability.
- `@nonrml/configs`: Shared runtime and build-time configuration (e.g., environment config, constants) for all packages and apps.
- `@nonrml/eslint-config`: Shared ESLint configuration to enforce consistent code style across the Turborepo.
- `@nonrml/otp`: OTP generation, validation, and delivery logic used across authentication workflows.
- `@nonrml/payment`: Handles payment integrations, payment session management, and transaction logic
- `@nonrml/prisma`: Shared Prisma ORM client and schema used for database access across the backend.
- `@nonrml/rate-limit`: Middleware and logic for handling rate-limiting across APIs
- `@nonrml/shipping`: Handles shipping logic, providers, tracking integrations, and cost estimations.
- `@nonrml/storage`: Abstraction over storage services like AWS S3, Supabase, and others.
- `@nonrml/trpc`: Centralized tRPC router and server logic shared across frontend and backend layers.
- `@nonrml/typescript-config`: Shared configuration to maintain consistent compiler behavior across packages and apps.

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Environment variables

Each app and package that requires environment variables includes a `.env.example` file with all necessary keys.
Make sure to create a `.env` file in the same directory and populate the values.


### Build

To build all apps and packages, run the following command:

```
turbo run build
```

### Develop

To develop all apps and packages, run the following command:

```
turbo run dev
```