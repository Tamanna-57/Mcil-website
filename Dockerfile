# Cloud Run image. Multi-stage so the runtime carries the built server and its
# runtime dependencies, not the toolchain or the source.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `standalone` emits a self-contained server with only the dependencies it
# actually reaches, which is most of the difference in image size.
ENV NEXT_OUTPUT=standalone
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as a non-root user; Cloud Run does not require it, but nothing here needs
# root either.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run sets PORT; this is the default for running the image elsewhere.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
