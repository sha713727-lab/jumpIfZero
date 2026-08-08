FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci

FROM deps AS frontend-build
COPY packages/contracts ./packages/contracts
COPY frontend ./frontend
ARG NEXT_PUBLIC_SITE_URL=https://jumpifzero.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w frontend

FROM node:24-bookworm-slim AS frontend
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=frontend-build /app/package.json /app/package-lock.json ./
COPY --from=frontend-build /app/node_modules ./node_modules
COPY --from=frontend-build /app/packages ./packages
COPY --from=frontend-build /app/frontend ./frontend
WORKDIR /app/frontend
EXPOSE 3010
CMD ["npx", "next", "start", "--hostname", "0.0.0.0", "--port", "3010"]

FROM deps AS backend
WORKDIR /app
ENV NODE_ENV=production
COPY packages/contracts ./packages/contracts
COPY backend ./backend
WORKDIR /app
EXPOSE 3011
CMD ["npm", "run", "start", "-w", "@jumpifzero/backend"]
