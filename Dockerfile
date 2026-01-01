# ------------------------------------------------------------
# Base
# ------------------------------------------------------------
FROM node:22-slim AS base

# ---------- Build arguments ----------
ARG VERSION="1.0.0"
ARG VCS_REF="unknown"
ARG BUILD_DATE="unknown"

LABEL \
    org.opencontainers.image.title="rpp-consumer-node" \
    org.opencontainers.image.description="RustPlus alarms consumer" \
    org.opencontainers.image.version="${VERSION}" \
    org.opencontainers.image.revision="${VCS_REF}" \
    org.opencontainers.image.created="${BUILD_DATE}"

ENV TZ="Europe/Madrid"

RUN groupadd -r runner && useradd -r -g runner runner \
    && mkdir -p /app /app/logs \
    && chown -R runner:runner /app

WORKDIR /app

COPY package*.json ./

# ------------------------------------------------------------
# Development
# ------------------------------------------------------------
FROM base AS dev

ENV NODE_ENV="development"

RUN npm install

COPY src scripts ./

RUN chown -R runner:runner /app

USER runner

CMD ["npm", "run", "start:dev"]

# ------------------------------------------------------------
# Production
# ------------------------------------------------------------
FROM base AS prod

ENV NODE_ENV="production"

RUN npm ci --omit=dev --ignore-scripts

COPY src scripts ./

RUN chown -R runner:runner /app

USER runner

CMD ["npm", "run", "start:prod"]
