FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

EXPOSE 4000

CMD ["node", "dist/index.js"]