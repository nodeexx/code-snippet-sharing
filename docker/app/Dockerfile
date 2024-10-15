# syntax=docker/dockerfile:1

FROM node:20.13.1-alpine3.18 as base-node-version

FROM base-node-version as install

# DEBUG: Check .dockerignore file
# DEBUG: Output configuration summary for NPM
# RUN npm config list

# NOTE: Rely on Node.js module resolution mechanism to find `node_modules` in
# the parent folder.
# https://nodejs.org/api/modules.html#loading-from-node_modules-folders
WORKDIR /node

# NOTE: Copy only files required for installing dependencies. Helps with
# layer caching.
COPY \
    package.json \
    package-lock.json \
    .npmrc* \
    ./
RUN --mount=type=cache,target=/root/.npm/_cacache,sharing=shared \
    npm ci --include dev

# WARN: DO NOT remove the following files, otherwise `npm prune` will delete
#       all dependencies.
# RUN rm -f \
#     package.json \
#     package-lock.json \
#     .npmrc*

# NOTE: Use if not mounting cache for dependency installation
# RUN npm cache clean --force

FROM install as migrate

WORKDIR /node/app

# NOTE: Copy only files required for dev migration
COPY ./prisma ./prisma
COPY \
    package.json \
    package-lock.json \
    .npmrc* \
    ./

CMD npx prisma migrate deploy

FROM install as build

ARG PUBLIC_POSTHOG_PROJECT_API_KEY=''
ARG PUBLIC_POSTHOG_API_HOST=''
ARG PUBLIC_SENTRY_ENVIRONMENT=''
ARG PUBLIC_SENTRY_DSN=''
ARG PUBLIC_SENTRY_ORGANIZATION=''
ARG PUBLIC_SENTRY_PROJECT_ID=''
ARG VITE_SENTRY_ORG=''
ARG VITE_SENTRY_PROJECT=''
ARG VITE_SENTRY_AUTH_TOKEN=''

ENV PUBLIC_POSTHOG_PROJECT_API_KEY=${PUBLIC_POSTHOG_PROJECT_API_KEY}
ENV PUBLIC_POSTHOG_API_HOST=${PUBLIC_POSTHOG_API_HOST}
ENV PUBLIC_SENTRY_ENVIRONMENT=${PUBLIC_SENTRY_ENVIRONMENT}
ENV PUBLIC_SENTRY_DSN=${PUBLIC_SENTRY_DSN}
ENV PUBLIC_SENTRY_ORGANIZATION=${PUBLIC_SENTRY_ORGANIZATION}
ENV PUBLIC_SENTRY_PROJECT_ID=${PUBLIC_SENTRY_PROJECT_ID}
ENV VITE_SENTRY_ORG=${VITE_SENTRY_ORG}
ENV VITE_SENTRY_PROJECT=${VITE_SENTRY_PROJECT}
ENV VITE_SENTRY_AUTH_TOKEN=${VITE_SENTRY_AUTH_TOKEN}

WORKDIR /node/app

# NOTE: Copy only files required for correct production build
COPY ./prisma ./prisma
COPY ./src ./src
COPY ./static ./static
COPY \
    package.json \
    package-lock.json \
    .npmrc* \
    .browserslistrc* \
    postcss.config.cjs \
    svelte.config.js \
    tailwind.config.ts \
    tsconfig.json \
    vite.config.ts \
    ./

ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

WORKDIR /node
# NOTE: Delete development dependencies from `node_modules`
# RUN npm prune --production
RUN npm prune --omit dev \
    && find node_modules -type d -empty -delete

FROM base-node-version as production-base

ARG MAINTENANCE_MODE=false

ENV MAINTENANCE_MODE=${MAINTENANCE_MODE}

# Set this with shell variables at build-time.
# ARG IMAGE_NAME
# If they aren't set, then not-set will be default.
# ARG IMAGE_DESCRIPTION=not-set
# ARG IMAGE_AUTHORS=not-set
# ARG IMAGE_CREATED_DATE=not-set
# ARG IMAGE_SOURCE_COMMIT=not-set
# ARG IMAGE_TITLE=not-set
# ARG IMAGE_URL=not-set
# ARG IMAGE_SOURCE=not-set
# ARG IMAGE_LICENSES=MIT

# NOTE: Labels from https://github.com/opencontainers/image-spec/blob/master/annotations.md
# LABEL org.opencontainers.image.authors=${IMAGE_AUTHORS}
# LABEL org.opencontainers.image.created=${IMAGE_CREATED_DATE}
# LABEL org.opencontainers.image.revision=${IMAGE_SOURCE_COMMIT}
# LABEL org.opencontainers.image.title=${IMAGE_TITLE}
# LABEL org.opencontainers.image.description=${IMAGE_DESCRIPTION}
# LABEL org.opencontainers.image.url=${IMAGE_URL}
# LABEL org.opencontainers.image.source=${IMAGE_SOURCE}
# LABEL org.opencontainers.image.licenses=${IMAGE_LICENSES}
# LABEL com.mycorp.myteam.nodeversion=$NODE_VERSION

USER root

# NOTE: Add Tini to reap zombie processes and handle signals correctly.
#       Not needed, if using host PID mode.
# RUN apk update \
#     && apk add --no-cache tini=0.19.0-r1

# NOTE: Add curl for healthcheck
RUN apk update \
    && apk add --no-cache curl

WORKDIR /node
COPY --from=build /node/node_modules ./node_modules
WORKDIR /node/app
COPY --from=build /node/app/build ./build
# NOTE: For documentation purposes only
COPY ./docker/app/Dockerfile ./docker/app/Dockerfile
COPY \
    package.json \
    README.md \
    ./
RUN chown -R node:node /node

USER node
ENV NODE_ENV=production
# NOTE: For documentation purposes only
EXPOSE 3000
# NOTE: Not needed, if using host PID mode
# ENTRYPOINT ["/sbin/tini", "--"]
CMD node build

HEALTHCHECK \
    --start-period=10s \
    --interval=1m \
    CMD curl --fail http://localhost:3000/api/healthcheck || exit 1
