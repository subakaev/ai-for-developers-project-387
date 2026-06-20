# syntax=docker/dockerfile:1

# ---- Build stage: install all workspaces and build both apps ----
FROM node:22-slim AS build
WORKDIR /app

# Install against the lockfile. Copy manifests first so this layer is cached
# until dependencies actually change.
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/contract/package.json packages/contract/
RUN npm ci

# Build the SPA against a same-origin API base ("" -> calls /event-types etc.
# on the backend's own origin), then compile the Nest server. Both apps use the
# committed src/api/schema.d.ts, so no TypeSpec/contract build is needed here.
COPY . .
ENV VITE_API_BASE_URL=""
RUN npm run build -w @calls/frontend \
  && npm run build -w @calls/backend

# ---- Runtime stage: production deps + built output only ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/contract/package.json packages/contract/
RUN npm ci --omit=dev

# Compiled Nest server + built SPA assets (the backend serves the SPA).
COPY --from=build /app/apps/backend/dist apps/backend/dist
COPY --from=build /app/apps/frontend/dist apps/frontend/dist

# Render and the Hexlet grader inject PORT; the server reads process.env.PORT
# and binds 0.0.0.0. EXPOSE is informational only.
EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
