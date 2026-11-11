# Learn Tube moderation worker: Node + ffmpeg. Deploy on Fly.io / Railway / AWS ECS (not serverless).
FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm install --no-save tsx
COPY src/lib ./src/lib
COPY worker ./worker
ENV NODE_ENV=production
CMD ["npx", "tsx", "worker/moderate-videos.ts"]
