**`README.md` and Wiki are under construction 👷🚧🏗️**

Table of contents

-   [Origin story](#origin-story)
-   [App feature outline](#app-feature-outline)
-   [Notable project features](#notable-project-features)
-   [The stack](#the-stack)
-   [Environment variables](#environment-variables)
-   [Development](#development)
    -   [Requirements](#requirements)
    -   [Setup and processes](#setup-and-processes)
    -   [Useful command summary](#useful-command-summary)
-   [Deployment](#deployment)

# Origin story

Hey there, welcome to the `code-snippet-sharing` project! It started as an attempt to create a full-stack setup based on the SvelteKit framework by creating a simple CRUD app. But I've enjoyed working with this stack so much, that the project quickly transformed into a kitchen sink regarding to the usage of supporting libraries and services. I still actively use it to experiment with SvelteKit and learn/test new tools (e.g. analytics, crashalytics, logging, monitoring).

When I was a less experienced dev, I always yearned for encountering a real-world example of a full-stack app with a complete support tooling setups (e.g. for unit tests, E2E tests, linting, CI/CD). [CodebaseShow – RealWorld Example Apps](https://codebase.show/projects/realworld) initiative is very useful for taking inspiration regarding meeting common functional requirements, but it does not meet my requirements regarding the support tooling. I guess, in the end, I've created what I wanted myself :)

This project is a total overkill as an example of a simple CRUD app... But I think its individual parts/features or how they come together may prove useful to others (e.g. how to unit test SvelteKit app, how to create a Playwright E2E setup), so I've decided to publish it and document some stuff regarding it on a Wiki. Dig in and explore the codebase or Wiki at your pleasure (and risk)!

# App feature outline

**Authentication**

-   Sign in / Sign up via Google Sign in (anyone can create an account)
-   Sign out

**View all existing code snippets**

-   Available to all users (signed-in or signed-out)
-   Filtering (current user)
-   Sorting (creation date)
-   Pagination

**View code snippet's details**

-   Available to all users (signed-in or signed-out)

**Create code snippet**

-   Available only to signed-in users

**Edit code snippet**

-   Available only to code snippet's author

**Delete code snippet**

-   Available only to code snippet's author
-   Soft delete

# Notable project features

🎭 E2E testing via Playwright for main happy paths  
🌐 API testing via Playwright API testing for main happy paths  
🧪 Unit tests via Vitest and Svelte testing library  
🔄 CI/CD using GitHub Actions and Northflank Pipelines  
🧹 Comprehensive linting setup  
🚀 Deployment via Northflank  
🐳 Ability to easily run the whole stack locally with different Dockerization levels  
📝 Centralized app config  
🎨 Centralized design token management  
⚙️ Client works even without enabled JavaScript (with some exceptions)  
🛠️ Maintenance mode enabled during deployments  
🔀 Smart redirects for signed-in/sign-out states  
📢 Standardized user notifications  
🚫 Comprehensive global error handling  
🛑 Configured graceful server shutdown  
🩺 Includes `healthcheck` API endpoint  
📐 Responsive app UI  
👨‍💻 Useful VSCode settings and extensions  
💬 A lot of helpful comments in the codebase

See [Notable features](https://github.com/nodeexx/code-snippet-sharing/wiki/Notable-features) Wiki page for more details.

# The stack

See [The stack](https://github.com/nodeexx/code-snippet-sharing/wiki/The-stack) Wiki page for more details.

# Environment variables

See `.env.template`.

**Development only**

Used by Vite and Docker Compose.

**Development and production**

Backend only

-   `ORIGIN`
    -   [Node servers • Docs • SvelteKit](https://kit.svelte.dev/docs/adapter-node#environment-variables)
    -   Must be defined
-   `MAINTENANCE_MODE`
    -   Enables maintenance mode (redirects all routes to `/maintenance`)
    -   `true` to enable, anything else to disable
-   `DATABASE_URL`
    -   Database connection string used by Prisma
    -   Must be defined
-   `GOOGLE_OAUTH_APP_CLIENT_ID`
    -   Used for authentication with Google OAuth 2
    -   Must be defined
-   `GOOGLE_OAUTH_APP_CLIENT_SECRET`
    -   Used for authentication with Google OAuth 2
    -   Must be defined
-   `GOOGLE_OAUTH_APP_REDIRECT_URI`
    -   Where to redirect user after successful Google OAuth 2 authentication
    -   Must be defined
-   `POSTHOG_PROJECT_API_KEY`
    -   Used for authenticating Posthog event requests
    -   Optional
    -   Find value in the related Posthog project
-   `POSTHOG_API_HOST`
    -   URL where to send Posthog events
    -   Optional
    -   E.g. `https://eu.posthog.com` for EU region

Backend and Frontend

-   `PUBLIC_SENTRY_ENVIRONMENT`
    -   Environment associated with sent Sentry requests
    -   [Environments](https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/environments/)
    -   Optional
    -   Possible values
        -   `localhost` for local development
        -   `staging` for staging environment
        -   `production` for production environment
-   `PUBLIC_SENTRY_DSN`
    -   URL where to send Sentry requests
    -   [Basic Options](https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#dsn)
    -   Optional
-   `VITE_SENTRY_ORG`
    -   Sentry org slug
    -   Can be found in "Organization Settings" in the Sentry app
    -   Used to upload source maps for both server and client builds to Sentry via Vite plugin
    -   Optional
-   `VITE_SENTRY_PROJECT`
    -   Sentry project slug
    -   Used to upload source maps for both server and client builds to Sentry via Vite plugin
    -   Optional
-   `VITE_SENTRY_AUTH_TOKEN `
    -   Sentry auth token
    -   Can be found in "Auth tokens" in the Sentry app
    -   Used to upload source maps for both server and client builds to Sentry via Vite plugin
    -   Optional

# Development

## Requirements

**Software**

-   Node.js (see `package.json` for the minimum recommended version)
-   Docker
-   Docker Compose

Setup

-   Create and fill out values in `.env.local` and `.env.playwright` files
    -   See Environment variables section and `.env.template` file
    -   NOTE: `.env.*.secret` files serve the repository author's needs only 😉
-   `npm ci`
-   `npm run playwright:install:browsers`
-   `npm run playwright:install:dependencies`

## Setup and processes

See [Development ‐ Setup and processes](https://github.com/nodeexx/code-snippet-sharing/wiki/Development-%E2%80%90-Setup-and-processes) Wiki page for more details.

## Useful command summary

**General development commands**

-   `npm run dev`
    -   Runs PostgreSQL via Docker Compose and app outside of it via `vite dev`
    -   Database is automatically migrated
    -   Seeds are not applied
-   `scripts/stack/local/infra/stack-only/migrate.js` for migrating already running PostgreSQL container
-   `./scripts/stack/local/infra/stack-only/seed.js` for applying seeds
    -   Apply seeds

**Run unit tests**

-   `npm run test:unit:node` for server tests
-   `npm run test:unit:dom` for client tests
-   Add `:coverage` suffix for generating coverage report

**Run API/E2E tests**

-   `./scripts/stack/local/infra-app/playwright/api/ui.js` for running API tests in UI mode
-   `./scripts/stack/local/infra-app/playwright/e2e/ui.js` for running E2E tests in UI mode

**Linting**

-   `npm run lint:fix` for running all linters and fixing auto-fixable linting errors

# Deployment

See [Deployment ‐ Setup and processes](https://github.com/nodeexx/code-snippet-sharing/wiki/Deployment-%E2%80%90-Setup-and-processes) Wiki page for more details.
