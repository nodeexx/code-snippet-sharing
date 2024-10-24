FROM mcr.microsoft.com/playwright:v1.48.1-jammy as common

WORKDIR /playwright

ENV PATH /playwright/node_modules/.bin:$PATH

# Get the needed libraries to run Playwright
RUN apt-get update && apt-get -y install \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm-dev \
    libxkbcommon-dev \
    libgbm-dev \
    libasound-dev \
    libatspi2.0-0 \
    libxshmfence-dev

COPY \
    package.json \
    package-lock.json \
    .npmrc* \
    ./

RUN --mount=type=cache,target=/root/.npm/_cacache,sharing=shared \
    npm ci

COPY \
    tsconfig.json \
    playwright.common.config.ts \
    ./

# NOTE: Needed for seed scripts
COPY ./scripts/app ./scripts/app
COPY ./prisma ./prisma
RUN npx prisma generate

COPY ./tests/playwright/common ./tests/playwright/common

FROM common as e2e

COPY playwright.e2e.config.ts ./

COPY ./tests/playwright/e2e ./tests/playwright/e2e

# NOTE: Useful for debug purposes
# CMD tail -f /dev/null

# WARN: Be careful with the order of the commands, because scripts rely on the
# exit status of the test command.
CMD npm run test:e2e:only \
    ; exit_status=$? \
    ; chmod a+rwx -R ./reports/playwright/e2e \
    ; exit $exit_status

FROM common as api

COPY playwright.api.config.ts ./

# NOTE: Some files are required by common setup
COPY ./tests/playwright/e2e/page-objects ./tests/playwright/e2e/page-objects

COPY ./tests/playwright/api ./tests/playwright/api

# NOTE: Useful for debug purposes
# CMD tail -f /dev/null

# WARN: Be careful with the order of the commands, because scripts rely on the
# exit status of the test command.
CMD npm run test:api:only \
    ; exit_status=$? \
    ; chmod a+rwx -R ./reports/playwright/api \
    ; exit $exit_status
