FROM node:24-bookworm AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci \
  && npm install --no-save \
    lightningcss-linux-x64-gnu \
    @tailwindcss/oxide-linux-x64-gnu

FROM deps AS frontend-build
COPY packages/contracts ./packages/contracts
COPY frontend ./frontend
ARG NEXT_PUBLIC_SITE_URL=https://jumpifzero.com
ARG SESSION_SECRET
ARG BACKEND_BASE_URL=http://127.0.0.1:3011
ARG HMAC_SECRET
ARG HMAC_KEY_ID=v1
ARG HMAC_GATEWAY_SUBJECT_ID
ARG DEMO_ADMIN_EMAIL=admin@jumpifzero.com
ARG DEMO_ADMIN_PASSWORD
ARG DEMO_EMPLOYEE_PASSWORD
ARG DEMO_CUSTOMER_PASSWORD
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV SESSION_SECRET=$SESSION_SECRET
ENV BACKEND_BASE_URL=$BACKEND_BASE_URL
ENV HMAC_SECRET=$HMAC_SECRET
ENV HMAC_KEY_ID=$HMAC_KEY_ID
ENV HMAC_GATEWAY_SUBJECT_ID=$HMAC_GATEWAY_SUBJECT_ID
ENV DEMO_ADMIN_EMAIL=$DEMO_ADMIN_EMAIL
ENV DEMO_ADMIN_PASSWORD=$DEMO_ADMIN_PASSWORD
ENV DEMO_EMPLOYEE_PASSWORD=$DEMO_EMPLOYEE_PASSWORD
ENV DEMO_CUSTOMER_PASSWORD=$DEMO_CUSTOMER_PASSWORD
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
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
WORKDIR /app/backend
EXPOSE 3011
CMD ["node", "--experimental-strip-types", "src/server.ts"]
