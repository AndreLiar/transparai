# ── Stage 1: deps ────────────────────────────────────────────────────────────
# Install production dependencies in a separate layer so they are cached
# independently from application source changes.
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only the dependency manifests first (layer cache optimisation)
COPY package.json package-lock.json .npmrc ./

RUN npm ci --omit=dev --legacy-peer-deps

# ── Stage 2: production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (everything not excluded by .dockerignore)
COPY . .

# Fix ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Render injects PORT at runtime; default to 10000 to match render.yaml
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:10000/health || exit 1

CMD ["node", "index.js"]
