# Dockerfile multi-stage pour Next.js 15 avec Puppeteer
# Optimisé pour VPS OVH

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les dépendances depuis deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Générer le client Prisma
RUN npx prisma generate

# Build Next.js (crée .next/standalone)
RUN npm run build

# ============================================
# Stage 3: Runner avec Chromium (pour Puppeteer)
# ============================================
FROM node:20-alpine AS runner

# Installer Chromium et dépendances pour Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    dumb-init

# Variables d'environnement pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Créer les dossiers nécessaires
RUN mkdir -p /app/uploads /app/logs /app/public/uploads && \
    chown -R nextjs:nodejs /app

# Copier les fichiers nécessaires depuis builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copier les fichiers de seed (optionnel pour init DB)
COPY --from=builder --chown=nextjs:nodejs /app/prisma/seed-*.ts ./prisma/

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Exposer le port
EXPOSE 3000

# Changer vers l'utilisateur non-root
USER nextjs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application avec dumb-init (gestion signaux)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
