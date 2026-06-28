# ── Stage 1: Build the React frontend ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
# Vite outputs directly to ../backend/public (see vite.config.js)
RUN npm run build


# ── Stage 2: Production runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ .
# Copy the built React SPA from the builder stage
COPY --from=builder /build/backend/public ./public

# Media root is mounted as a volume at runtime
ENV MEDIA_ROOT=/volume1/media
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
